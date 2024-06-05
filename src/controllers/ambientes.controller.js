import { Ambiente } from '../models/Ambiente.js'
import { Disponible } from '../models/Disponible.js'
import { Periodo } from '../models/Periodo.js'
import { Baja } from '../models/Baja.js'
import { Usuario } from '../models/Usuario.js';
import { Reserva } from '../models/Reserva.js';
import { Notificacion } from '../models/Notificacion.js';
import { Auxiliar_reserva } from '../models/Auxiliar_reserva.js';
import { Aux_grupo } from '../models/Aux_grupos.js';
import { Grupo } from '../models/Grupo.js';
import { Materia } from '../models/Materia.js';

import { sequelize } from "../database/database.js";

import { Op } from 'sequelize';
import moment from 'moment';

export const getAmbientes = async (req, res) =>{
    try {
        const ambientes = await Ambiente.findAll({
            raw: true,
            order: [['actualizacion', 'DESC'], ['id_ambiente', 'DESC']]
        });
        
        const ambientesFormateados = ambientes.map(ambiente => {
            const idFormateado = ambiente.id_ambiente.toString().padStart(3, '0');
            return {
                ...ambiente,
                id_ambiente_tabla : idFormateado
            };
        });

        res.json(ambientesFormateados);
    } catch (error) {
        return res.status(500).json({ message: error.status });
    }
};


export const getAmbiente = async (req, res) => {
    try {
        const { id_ambiente } = req.params;
        const ambiente = await Ambiente.findOne({ where: { id_ambiente } });
        if (!ambiente) return res.status(404).json({ message: "El ambiente no existe" });
        const idFormateado = String(id_ambiente).padStart(3, '0'); 
        const ambienteFormateado = {
            ...ambiente.toJSON(), 
            id_ambiente: idFormateado
        };
        res.json(ambienteFormateado); 
    } catch (error) {
        return res.status(500).json({ message: error.status });
    }
}

export const createAmbienteCompleto = async (req, res) => {
    try {
        const { nombre_ambiente, tipo, capacidad, disponible, computadora, proyector, ubicacion, dia, porcentaje_min, porcentaje_max } = req.body;
        
        const ambiente = await Ambiente.create({
            nombre_ambiente,
            tipo,
            capacidad,
            disponible,
            computadora,
            proyector,
            ubicacion,
            porcentaje_min,
            porcentaje_max,
            actualizacion: moment().tz("America/La_Paz").toDate()
        });

        for (const diaNombre in dia) { 
            const periodos = dia[diaNombre].periodos; 
            for (const periodo of periodos) {
                await Disponible.create({
                    ambiente_id: ambiente.id_ambiente,
                    dia: diaNombre, 
                    periodo_id: periodo.id_periodo,
                    habilitado: true
                });
            }
        }
        return res.status(201).json({ message: 'Ambiente creado exitosamente' });
    } catch (error) {
        console.error('Error al crear ambiente completo:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};






export const createAmbiente = async (req, res) =>{
    //extraer los datos del body

    const { nombre_ambiente,tipo,capacidad,disponible,computadora,proyector,ubicacion ,porcentaje_min,porcentaje_max }= req.body
    try {
        const newAmbiente = await Ambiente.create({
            nombre_ambiente,tipo,capacidad,disponible,computadora,proyector,ubicacion,porcentaje_min,porcentaje_max
        });
        res.json(newAmbiente);
    } catch (error) {
        return res.status(500).json({message: error.status})
    }   
}


export const updateAmbiente = async (req,res)=>{  
    
    try {
        const {id_ambiente} = req.params;
        const {nombre_ambiente,tipo,capacidad,computadora,ubicacion, disponible,proyector,porcentaje_min,porcentaje_max} = req.body; 

        const ambiente = await Ambiente.findByPk(id_ambiente)

        ambiente.nombre_ambiente = nombre_ambiente;
        ambiente.tipo = tipo;
        ambiente.capacidad = capacidad;
        ambiente.computadora = computadora;
        ambiente.ubicacion = ubicacion;
        ambiente.disponible = disponible;
        ambiente.proyector = proyector;
        ambiente.porcentaje_min = porcentaje_min;
        ambiente.porcentaje_max = porcentaje_max;

        await ambiente.save()

        res.json(ambiente)
    } catch (error) {
        return res.status(500).json({message: error.status})
    }
}

export const deleteAmbiente = async (req, res) => {
    try {
        const { id_ambiente } = req.params;
        await Ambiente.destroy({ where: { id_ambiente } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const editarAmbienteCompleto = async (req, res) => {
    try {
        //const {  } = req.params.id_ambiente;
        const {id_ambiente , nombre_ambiente, tipo, capacidad, disponible, computadora, proyector, ubicacion, dia, porcentaje_min, porcentaje_max } = req.body;
        console.log(id_ambiente)
        
        await Ambiente.update({
            nombre_ambiente,
            tipo,
            capacidad,
            disponible,
            computadora,
            proyector,
            ubicacion,
            porcentaje_min,
            porcentaje_max,
            actualizacion: moment().tz("America/La_Paz").toDate()
        }, {
            where: {
                id_ambiente: id_ambiente
            }
        });

        await Disponible.update(
            { habilitado: false },
            {
                where: {
                    ambiente_id: id_ambiente
                }
            }
        );
        
        for (const diaNombre in dia) { 
            const periodos = dia[diaNombre].periodos; 
            for (const periodo of periodos) {
                const [updatedCount] = await Disponible.update(
                    { habilitado: true },
                    {
                        where: {
                            ambiente_id: id_ambiente,
                            dia: diaNombre,
                            periodo_id: periodo.id_periodo
                        }
                    }
                );
                if (updatedCount === 0) {
                    await Disponible.create({
                        ambiente_id: id_ambiente,
                        dia: diaNombre,
                        periodo_id: periodo.id_periodo,
                        habilitado: true
                    });
                }
            }
        }

        return res.status(200).json({ message: 'Ambiente editado exitosamente' });
    } catch (error) {
        console.error('Error al editar ambiente completo:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const registrarBaja = async (req, res) => {
    try {
        const { id_ambiente, motivo } = req.body;

        const ambiente = await Ambiente.findByPk(id_ambiente);
        
        if (!ambiente) {
            return res.status(404).json({ message: 'Ambiente no encontrado' });
        }
        if (ambiente.disponible == false) {
            return res.status(200).json({ message: 'El ambiente ya fue dado de baja anteriormente' });
        }

        const createBaja = await Baja.create({
            ambiente_id: id_ambiente,
            motivo,
        });
 
        ambiente.disponible = false;
        ambiente.actualizacion = sequelize.literal('CURRENT_TIMESTAMP - interval \'4 hours\'')
        await ambiente.save();

        const disponibles = await Disponible.findAll({
            attributes: ['id_disponible'],
            where: {
                ambiente_id: id_ambiente,
            },
        });
        const dispIds = disponibles.map(disponible => disponible.id_disponible);

        const reservasIds = await Reserva.findAll({
            attributes: ['id_reserva'],where: {disponible_id: dispIds,estado: 'vigente',},
        });

        const users = await Usuario.findAll({ where: { tipo_usuario: ['DOCENTE','AUXILIAR']} });
        const usuarios = users.map(user => user.id_usuario);

        const descripcion = `SE COMUNICA QUE EL AMBIENTE "${ambiente.nombre_ambiente}" HA SIDO DESHABILITADO PARA SU USO${motivo ? `, POR EL SIGUIENTE MOTIVO: ${motivo}` : ''}`;

        const notificaciones = usuarios.map(usuario_id  => ({
            usuario_id ,
            descripcion,
            leido: false
        }));
        await Notificacion.bulkCreate(notificaciones);

        const idsReservas = reservasIds.map(reserva => reserva.id_reserva);

        notificarUsuarios(idsReservas, ambiente.nombre_ambiente , motivo)
        //console.log(idsReservas)

        await Reserva.update(
            { estado: 'cancelado' },
            {
                where: {
                    disponible_id: dispIds,
                    estado: 'vigente',
                },
            }
        );

        return res.json(createBaja);
    } catch (error) {
        console.error('Error al editar ambiente completo:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

async function notificarUsuarios(idsReservas, nombre_ambiente , motivo) {
    const reservas = await Reserva.findAll({
        where: {
            id_reserva: idsReservas
        },
        include: [
            {
                model: Disponible,
                include: [
                    {
                        model: Periodo,
                        attributes: ['hora_inicio', 'hora_fin']
                    }
                ]
            },
            {
                model: Auxiliar_reserva,
                include: [
                    {
                        model: Aux_grupo,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id_usuario']
                            }
                        ],
                        include: [
                            {
                                model: Grupo,
                                attributes: ['nombre_grupo'],
                                include: [
                                    {
                                        model: Materia,
                                        attributes: ['nombre_materia'],
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        raw: true
    });
    //console.log(reservas);
    

    for (const reserva of reservas) {
        let nombreMateria = reserva['auxiliar_reservas.aux_grupo.grupo.materia.nombre_materia'];
        let nombreGrupo = reserva['auxiliar_reservas.aux_grupo.grupo.nombre_grupo'];

        let descripcion = `SE COMUNICA QUE SU RESERVA DEL AMBIENTE "${nombre_ambiente}" PARA LA MATERIA "${nombreMateria} - ${nombreGrupo}" EN FECHA ${moment(reserva.fecha_reserva).format('DD-MM-YYYY')} Y EN HORARIO ${moment(reserva['disponible.periodo.hora_inicio'], 'HH:mm').format('HH:mm')} - ${moment(reserva['disponible.periodo.hora_fin'], 'HH:mm').format('HH:mm')} SE HA CANCELADO.`;
        await Notificacion.create({
          usuario_id: reserva['auxiliar_reservas.aux_grupo.usuario_id'],
          descripcion,
          leido: false
        });
    }
}


export const registrarAlta = async (req, res) => {
    try {
        const { id_ambiente } = req.params

        const ambiente = await Ambiente.findByPk(id_ambiente);

        if (!ambiente) {
            return res.status(404).json({ message: 'Ambiente no encontrado' });
        }
        if (ambiente.disponible) {
            return res.status(200).json({ message: 'El ambiente ya fue dado de alta anteriormente' });
        }

        ambiente.disponible = true;
        ambiente.actualizacion = sequelize.literal('CURRENT_TIMESTAMP - interval \'4 hours\'')
        await ambiente.save();
        
        const users = await Usuario.findAll({ where: { tipo_usuario: ['DOCENTE','AUXILIAR']} });
        const usuarios = users.map(user => user.id_usuario);

        const descripcion = `SE COMUNICA QUE EL AMBIENTE "${ambiente.nombre_ambiente}" HA SIDO HABILITADO PARA SU USO`;
    
        const notificaciones = usuarios.map(usuario_id  => ({
            usuario_id ,
            descripcion,
            leido: false
        }));

        await Notificacion.bulkCreate(notificaciones);

        return res.json(ambiente);
    } catch (error) {
        console.error('Error al editar ambiente completo:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const reporteAmbientes = async (req, res) => {
    try {
        let { fecha_inicio, fecha_fin } = req.body;

        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);

        fechaFin.setDate(fechaFin.getDate() + 1);

        const ambientes = await Ambiente.findAll({
            attributes: [
                'nombre_ambiente',
                'capacidad',
                'disponible',
                'tipo',
                [sequelize.fn('COUNT', sequelize.col('disponibles->reservas.id_reserva')), 'cantidad_reservas']
            ],
            include: [{
                model: Disponible,
                attributes: [],
                include: [{
                    model: Reserva,
                    attributes: [],
                    where: {
                        estado: 'vigente',
                        fecha_reserva: {
                            [Op.between]: [fechaInicio, fechaFin]
                        }
                    }
                }]
            }],
            group: ['ambientes.id_ambiente'],
            order: [[sequelize.literal('cantidad_reservas'), 'DESC']],
            raw: true
        });

        const ambientesModificados = ambientes.map(ambiente => ({
            ...ambiente,
            disponible: ambiente.disponible ? 'HABILITADO' : 'DESHABILITADO',
            tipo: ambiente.tipo.toUpperCase()
        }))
        .filter(ambiente => ambiente.cantidad_reservas > 0);

        const top = ambientesModificados.slice(0, 10);
        res.json(top);
    } catch (error) {
        console.error('Error al obtener el reporte de ambientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}