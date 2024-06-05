import { Apertura } from '../models/Apertura.js';
import { Usuario } from '../models/Usuario.js';
import { Notificacion } from '../models/Notificacion.js';
import { Op } from 'sequelize';
import moment from 'moment';


const formatDateTime = (dateString) => {
    return moment(dateString).format('DD-MM-YYYY');
};

export const getAperturas = async (req, res) => {
    try {
        const aperturas = await Apertura.findAll({
            order: [['id_apertura', 'DESC']],
        });

        res.json(aperturas);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAperturasTabla = async (req, res) => {
    try {
        const aperturas = await Apertura.findAll({
            order: [['id_apertura', 'DESC']],
        });

        const aperturasFormateadas = aperturas.map(apertura => {
            const inicio = apertura.apertura_inicio instanceof Date ? formatDateTime(apertura.apertura_inicio) : apertura.apertura_inicio;
            const fin = apertura.apertura_fin instanceof Date ? formatDateTime(apertura.apertura_fin) : apertura.apertura_fin;

            let tipoUsuarioNombre = '';
            if (apertura.docente && apertura.auxiliar) {
                tipoUsuarioNombre = 'DOCENTE - AUXILIAR';
            } else if (apertura.docente) {
                tipoUsuarioNombre = 'DOCENTE';
            } else if (apertura.auxiliar) {
                tipoUsuarioNombre = 'AUXILIAR';
            }

            const inicioHoraMinutos = apertura.apertura_hora_inicio.slice(0, 5);
            const finHoraMinutos = apertura.apertura_hora_fin.slice(0, 5); 
            const periodo = `${formatDateTime(apertura.reserva_inicio)} ${formatDateTime(apertura.reserva_fin)}`;

            const now = moment().tz("America/La_Paz").toDate();

            console.log(now)
            // Estado
            let estado = '';
            
                if (now > apertura.apertura_fin) {
                    estado = 'FINALIZADO';
                } else if (now >= apertura.apertura_inicio && now <= apertura.apertura_fin) {
                    estado = 'EN CURSO';
                } else if (now < apertura.apertura_inicio) {
                    estado = 'VIGENTE';
                }
            console.log(estado)

            return {
                "inicio_apertura": `${inicioHoraMinutos} ${inicio}`,
                "fin_apertura": `${finHoraMinutos} ${fin}`,
                "periodo_reservas": periodo,
                "tipo_usuario": tipoUsuarioNombre,       
                "motivo": apertura.motivo,
                "estado": estado
            };
        });

        res.json(aperturasFormateadas);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getApertura = async (req, res) => {
    try {
        const { id_apertura } = req.params;
        const apertura = await Apertura.findOne({ where: { id_apertura } });

        if (!apertura) {
            return res.status(404).json({ message: "La apertura no existe" });
        }

        const inicioFormateado = formatDateTime(apertura.apertura_inicio);
        const finFormateado = formatDateTime(apertura.apertura_fin);
        const reservaInicioFormateado = formatDateTime(apertura.reserva_inicio);
        const reservaFinFormateado = formatDateTime(apertura.reserva_fin);

        const aperturaFormateada = {
            id_apertura: apertura.id_apertura,
            motivo: apertura.motivo,
            apertura_inicio: inicioFormateado,
            apertura_fin: finFormateado,
            apertura_hora_inicio: apertura.apertura_hora_inicio,
            apertura_hora_fin: apertura.apertura_hora_fin,
            reserva_inicio: reservaInicioFormateado,
            reserva_fin: reservaFinFormateado,
            registro_apertura: apertura.registro_apertura,
        };

        res.json(aperturaFormateada);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createApertura = async (req, res) => {
    try {
        const {
            motivo,
            apertura_inicio,
            apertura_fin,
            apertura_hora_inicio,
            apertura_hora_fin,
            reserva_inicio,
            reserva_fin,
            esDocente,
            esAuxiliar 
        } = req.body;

        const fechaInicio = new Date(`${apertura_inicio}T${apertura_hora_inicio}`);
        const fechaFin = new Date(`${apertura_fin}T${apertura_hora_fin}`);
   
        const nuevaApertura = await Apertura.create({
            motivo,
            apertura_inicio: fechaInicio,
            apertura_fin: fechaFin,
            apertura_hora_inicio,
            apertura_hora_fin,
            reserva_inicio,
            reserva_fin,
            docente : esDocente, 
            auxiliar : esAuxiliar 
        });

        let usuarios = [];
        if (esDocente) {
            const docentes = await Usuario.findAll({ where: { tipo_usuario: 'DOCENTE' } });
            usuarios = usuarios.concat(docentes.map(docente => docente.id_usuario));
        }
        if (esAuxiliar) {
            const auxiliares = await Usuario.findAll({ where: { tipo_usuario: 'AUXILIAR' } });
            usuarios = usuarios.concat(auxiliares.map(auxiliar => auxiliar.id_usuario));
        }

        const descripcion = `EL SISTEMA PARA REALIZAR SUS RESERVAS ESTARÁ HABILITADO DESDE EL ${moment(apertura_hora_inicio, 'HH:mm').format('HH:mm')} ${moment(apertura_inicio).format('DD-MM-YYYY')} HASTA ${moment(apertura_hora_fin, 'HH:mm').format('HH:mm')} ${moment(apertura_fin).format('DD-MM-YYYY')}`;
        
        const notificaciones = usuarios.map(usuario_id  => ({
            usuario_id ,
            descripcion,
            leido: false
        }));

        await Notificacion.bulkCreate(notificaciones);

        res.status(201).json(nuevaApertura);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateApertura = async (req, res) => {
    try {
        const { id_apertura } = req.params;
        const { apertura_inicio, apertura_fin, apertura_hora_inicio, apertura_hora_fin, reserva_inicio, reserva_fin } = req.body;

        const apertura = await Apertura.findByPk(id_apertura);
        apertura.apertura_inicio = apertura_inicio;
        apertura.apertura_fin = apertura_fin;
        apertura.apertura_hora_inicio = apertura_hora_inicio;
        apertura.apertura_hora_fin = apertura_hora_fin;
        apertura.reserva_inicio = reserva_inicio;
        apertura.reserva_fin = reserva_fin;

        await apertura.save();

        res.json(apertura);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteApertura = async (req, res) => {
    try {
        const { id_apertura } = req.params;
        await Apertura.destroy({ where: { id_apertura } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const aperturaPorFecha = async (req, res) => {
    try {
        const fechaActual = moment().tz("America/La_Paz").toDate(); 
        console.log(fechaActual); 
        
        const aperturas = await Apertura.findAll({
            where: {
                [Op.and]: [
                    //{ apertura_inicio: { [Op.lte]: fechaActual } },
                    { apertura_fin: { [Op.gte]: fechaActual } }
                ]
            },
            order: [
                ['apertura_inicio', 'ASC'] 
            ]
        });

        const now = moment().tz("America/La_Paz").subtract(4, 'hours').toDate();
        console.log('ESTA ES LA HORA DEL SISTEMA: '+now);

        // Agregar estado a cada apertura
        const aperturasConEstado = aperturas.map(apertura => {
            let estado = '';
            if (now > apertura.apertura_fin) {
                estado = 'FINALIZADO';
            } else if (now >= apertura.apertura_inicio && now <= apertura.apertura_fin) {
                estado = 'EN CURSO';
            } else if (now < apertura.apertura_inicio) {
                estado = 'VIGENTE';
            }

            return {
                ...apertura.toJSON(), // Convertir instancia de Sequelize a objeto simple
                estado
            };
        });

        res.json(aperturasConEstado);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const fechaSistema = async (req, res) => {
    try {

        
        const fechaActual = moment().tz("America/La_Paz").toDate();
        console.log('ESTA ES LA HOARA DEL SISTEMA '+ fechaActual )

        const now = moment().tz("America/La_Paz").subtract(4, 'hours').toDate();
        console.log('ESTA ES LA HORA DEL SISTEMA: '+ now);

        res.json(fechaActual)
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

} 