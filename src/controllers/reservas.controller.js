import { Reserva } from '../models/Reserva.js';
import { Ambiente } from '../models/Ambiente.js';
import { Disponible } from '../models/Disponible.js';
import { Periodo } from '../models/Periodo.js';
import { Auxiliar_reserva } from '../models/Auxiliar_reserva.js';
import { Usuario } from '../models/Usuario.js';
import { Aux_grupo } from '../models/Aux_grupos.js';

import { sequelize } from "../database/database.js"
import { Model } from 'sequelize';
import { Op } from 'sequelize';

import moment from 'moment';

const fechaFormateada = (dateString, soloFecha = false) => {
    return soloFecha ? moment(dateString).format('DD-MM-YYYY') : moment(dateString).format('HH:mm DD-MM-YYYY');
};

const fechaFormateada2 = (dateString, soloFecha = false) => {
    return soloFecha = moment(dateString).format('DD-MM-YYYY');
};

// {
//     "id_disponible": 226,
//     "fecha_reserva":"2024-04-17",
//     "motivo": "mi primera prueba",
//     "listaGrupos": [1,2,3], 
//     "id_apertura": 2 , 
//     "cantidad_total": 123
//   }

export const createReserva = async (req, res) => {
    const { id_disponible, fecha_reserva, motivo, listaGrupos, id_apertura, cantidad_total } = req.body;
    try {
        const existingReserva = await Reserva.findOne({ 
            where: { 
                disponible_id: id_disponible, 
                fecha_reserva: fecha_reserva + "T12:00:00.000Z" 
            } 
        });

        if (existingReserva) {
            return res.status(400).json({ message: 'Ya existe una reserva para este ambiente.' });
        }

        const newReserva = await Reserva.create({
            disponible_id: id_disponible,
            fecha_reserva: fecha_reserva + "T12:00:00.000Z",
            motivo: motivo,
            apertura_id: id_apertura,
            cantidad_total: cantidad_total,
            estado: 'vigente'
        });

        for (const grupoId of listaGrupos) {
            await Auxiliar_reserva.create({
                reserva_id: newReserva.id_reserva,
                aux_grupo_id: grupoId
            });
        }

        res.json(newReserva);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const getTablaDisponibles = async (req, res) => {
    try {
        const data = req.body
        const tipoAmbiente = data.tipo_ambiente
        const cantidadEst = data.cantidad_est
        const fechaInicial = data.fecha_reserva
        const fecha = fechaInicial + "T12:00:00.000Z"

        console.log('esta es la fecha ' + fecha)

        const periodosArray = data.periodos.map(periodos => periodos.id_periodo)
        

        const formatoFecha = obtenerParteFecha(fecha)
        const dia = convertirDiaHabil(formatoFecha)

        const ambientes = await Ambiente.findAll();
        const arrayIdsAmbientes = mapearAmbientes(ambientes, cantidadEst, tipoAmbiente);

        console.log(arrayIdsAmbientes)
        console.log(dia)
        console.log(periodosArray)


        const disponiblesAmbienteDia = await obtenerDisponibles(arrayIdsAmbientes, dia, periodosArray)

        console.log( '-----------------------------------------------------------')
        console.log( disponiblesAmbienteDia)

        const idsExcluir = await obtenerOcupados(fecha)
        console.log(idsExcluir)

        const disponiblesFiltrados = disponiblesAmbienteDia.filter(id => !idsExcluir.includes(id));
        console.log(disponiblesFiltrados)


        const ambientesDisponibles = await obtenerDetallesReservas(disponiblesFiltrados, fechaInicial)

        const ambientesConIdTabla = ambientesDisponibles.map(ambiente => {
            return {
                ...ambiente,
                id_tabla: String(ambiente.id_disponible).padStart(3, '0')
            };
        });

        res.json(ambientesDisponibles);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const mapearAmbientes = (ambientes, cantidadEst, tipoAmbiente) => {
    return ambientes
        .map(ambiente => {
            const { id_ambiente, tipo, capacidad, disponible, porcentaje_min, porcentaje_max } = ambiente;
            const capacidad_max = Math.floor(capacidad * (porcentaje_max / 100));
            const capacidad_min = Math.floor(capacidad * (porcentaje_min / 100));

            if (
                tipo === tipoAmbiente &&
                capacidad_min <= cantidadEst &&
                cantidadEst <= capacidad_max &&
                disponible === true 
            ) {
                return id_ambiente;
            } else {
                return null;
            }
        })
        .filter(id => id !== null);
};


const convertirDiaHabil = (fechaString) => {
    const partesFecha = fechaString.split('-');
    const dia = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;
    const año = parseInt(partesFecha[2], 10);
    const fecha = new Date(año, mes, dia);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return diasSemana[fecha.getDay()];
};

const obtenerParteFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}-${mes}-${año}`;
};

const obtenerDisponibles = async (arrayIdsAmbientes, diaFecha, arrayIdsPeriodos) => {
    const disponibles = await Disponible.findAll({
        attributes: ['id_disponible'], 
        where: {
            ambiente_id: arrayIdsAmbientes,
            dia: diaFecha,
            periodo_id: arrayIdsPeriodos,
            habilitado: true
        }
    });
    const disp = disponibles.map(disponible => disponible.id_disponible)
    return disp
};

const obtenerOcupados = async (fechaReserva) => {
    const reservas = await Reserva.findAll({
        attributes: ['disponible_id'],
        where: {
            fecha_reserva: fechaReserva,
        }
    });
    const ocupados = reservas.map(reserva => reserva.disponible_id)
    return ocupados
};

const obtenerDetallesReservas = async (disponiblesAmbienteDia, fechaReserva) => {
    const disponibles = await Disponible.findAll({
        where: {
            id_disponible: disponiblesAmbienteDia
        },
        include: [
            { model: Periodo },
            { model: Ambiente }
        ]
    });

    const mapeoDisponibles = disponibles.map(disponible => ({
        id_disponible: disponible.id_disponible,
        dia: disponible.dia,
        periodo_id: disponible.periodo.id_periodo,
        nombre_periodo: disponible.periodo.nombre_periodo,
        hora_inicio: disponible.periodo.hora_inicio,
        hora_fin:  disponible.periodo.hora_fin,
        ambiente_id: disponible.ambiente.id_ambiente,
        nombre_ambiente: disponible.ambiente.nombre_ambiente,
        tipo_ambiente: disponible.ambiente.tipo,
        capacidad_ambiente:  disponible.ambiente.capacidad,
        estado: 'Habilitado',
        fecha: fechaFormateada2(fechaReserva),
        id_tabla: String(disponible.id_disponible).padStart(3, '0')
    }));
    return mapeoDisponibles;
};


// export const getListaReservas = async (req, res) => {
//     try {
//         const result = await sequelize.query(`
//             SELECT R.id_reserva, u.nombre_usuario, u.tipo_usuario, 
//                 r.fecha_reserva, p.hora_inicio, p.hora_fin, g.nombre_grupo, M.nombre_materia,  A.nombre_ambiente 
//             FROM ambientes A
//             JOIN disponibles D ON A.id_ambiente = D.ambiente_id
//             JOIN periodos P ON D.periodo_id = P.id_periodo
//             JOIN reservas R ON r.disponible_id = D.id_disponible
//             JOIN auxiliar_reservas ar ON ar.reserva_id = R.id_reserva
//             JOIN aux_grupos ag ON ar.aux_grupo_id = ag.id_aux_grupo
//             JOIN grupos g ON g.id_grupo = ag.grupo_id
//             JOIN materias m ON g.materia_id = m.id_materia
//             JOIN usuarios u ON ag.usuario_id = u.id_usuario
//             ORDER BY R.id_reserva DESC`
//         , {
//             type: sequelize.QueryTypes.SELECT 
//         })
//         res.json(result);
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };



export const getListaReservas = async (req, res) => {
    try {
        const result = await sequelize.query(`
            SELECT R.id_reserva, LPAD(R.id_reserva::text, 3, '0') as id_reserva_lista, u.nombre_usuario, u.tipo_usuario, 
                   r.fecha_reserva, r.registro_reserva, r.estado, p.hora_inicio, p.hora_fin, 
                   string_agg(g.nombre_grupo, ', ' ORDER BY g.nombre_grupo) AS nombre_grupo, 
                   string_agg(m.nombre_materia || ' - ' || g.nombre_grupo, ', ' ORDER BY m.nombre_materia) AS nombre_materia,
                   A.nombre_ambiente,
                   R.cantidad_total AS cantidad_est,
                   SUM(g.cantidad_est) AS cantidad_sumada,
                   A.capacidad,
                   A.porcentaje_min,
                   A.porcentaje_max,
                   FLOOR(A.capacidad * (A.porcentaje_min / 100.0)) AS min_capacidad,
                   FLOOR(A.capacidad * (A.porcentaje_max / 100.0)) AS max_capacidad
            FROM ambientes A
            JOIN disponibles D ON A.id_ambiente = D.ambiente_id
            JOIN periodos P ON D.periodo_id = P.id_periodo
            JOIN reservas R ON r.disponible_id = D.id_disponible
            JOIN auxiliar_reservas ar ON ar.reserva_id = R.id_reserva
            JOIN aux_grupos ag ON ar.aux_grupo_id = ag.id_aux_grupo
            JOIN grupos g ON g.id_grupo = ag.grupo_id
            JOIN materias m ON g.materia_id = m.id_materia
            JOIN usuarios u ON ag.usuario_id = u.id_usuario
            GROUP BY R.id_reserva, u.nombre_usuario, u.tipo_usuario, 
                r.fecha_reserva, r.registro_reserva, r.estado, p.hora_inicio, p.hora_fin, A.nombre_ambiente, A.capacidad, A.porcentaje_min, A.porcentaje_max
            ORDER BY R.id_reserva DESC;
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        const combinedResult = result.reduce((acc, current) => {
            const existingItem = acc.find(item => item.id_reserva === current.id_reserva);
            if (existingItem) {
                existingItem.nombre_materia += `, ${current.nombre_materia}`;
                existingItem.nombre_grupo += `, ${current.nombre_grupo}`;
                existingItem.cantidad_sumada += current.cantidad_sumada;
            } else {
                current.registro_reserva_sin_formato = current.registro_reserva;
                current.registro_reserva = fechaFormateada(current.registro_reserva);  // Formato completo 
                current.fecha_reserva = fechaFormateada(current.fecha_reserva, true);  // Solo fecha

                if (moment(current.fecha_reserva, 'DD-MM-YYYY').isBefore(moment(), 'day')) {
                    current.estado = 'finalizado';
                }

                current.min_cap_max = `${current.min_capacidad} - ${current.capacidad} - ${current.max_capacidad}`;
                acc.push(current);
            }
            return acc;
        }, []);

        res.json(combinedResult);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




export const getListaReservasUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const result = await sequelize.query(`
            SELECT R.id_reserva, LPAD(R.id_reserva::text, 3, '0') as id_reserva_lista, u.nombre_usuario, u.tipo_usuario,
                   r.fecha_reserva, r.registro_reserva, r.estado, p.hora_inicio, p.hora_fin,
                   string_agg(g.nombre_grupo, ', ') AS nombre_grupo,
                   string_agg(m.nombre_materia || ' - ' || g.nombre_grupo, ', ') AS nombre_materia,
                   A.nombre_ambiente,
                   R.cantidad_total AS cantidad_est,
                   SUM(g.cantidad_est) AS cantidad_sumada,
                   A.capacidad,
                   A.porcentaje_min,
                   A.porcentaje_max,
                   FLOOR(A.capacidad * (A.porcentaje_min / 100.0)) AS min_capacidad,
                   FLOOR(A.capacidad * (A.porcentaje_max / 100.0)) AS max_capacidad
            FROM ambientes A
            JOIN disponibles D ON A.id_ambiente = D.ambiente_id
            JOIN periodos P ON D.periodo_id = P.id_periodo
            JOIN reservas R ON r.disponible_id = D.id_disponible
            JOIN auxiliar_reservas ar ON ar.reserva_id = R.id_reserva
            JOIN aux_grupos ag ON ar.aux_grupo_id = ag.id_aux_grupo
            JOIN grupos g ON g.id_grupo = ag.grupo_id
            JOIN materias m ON g.materia_id = m.id_materia
            JOIN usuarios u ON ag.usuario_id = u.id_usuario
            WHERE u.id_usuario = :id_usuario
            GROUP BY R.id_reserva, u.nombre_usuario, u.tipo_usuario,
                r.fecha_reserva, r.registro_reserva, r.estado, p.hora_inicio, p.hora_fin, A.nombre_ambiente, A.capacidad, A.porcentaje_min, A.porcentaje_max
            ORDER BY R.id_reserva DESC;
        `, {
            replacements: { id_usuario },
            type: sequelize.QueryTypes.SELECT
        });

        const combinedResult = result.map(item => {
            item.registro_reserva_sin_formato = item.registro_reserva;
            item.registro_reserva = fechaFormateada(item.registro_reserva);  // Formato completo
            item.fecha_reserva = fechaFormateada(item.fecha_reserva, true);  // Solo fecha

            if (moment(item.fecha_reserva, 'DD-MM-YYYY').isBefore(moment(), 'day')) {
                item.estado = 'finalizado';
            }

            item.min_cap_max = `${item.min_capacidad} - ${item.capacidad} - ${item.max_capacidad}`;

            return item;
        });

        res.json(combinedResult);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const reporteDocentes = async (req, res) => {
    try {
        let { fecha_inicio, fecha_fin } = req.body;

        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);

        fechaFin.setDate(fechaFin.getDate() + 1);

        const docentes = await Usuario.findAll({
            attributes: [
                'nombre_usuario',
                'tipo_usuario',
                'codsiss',
                [sequelize.fn('COUNT', sequelize.col('aux_grupos->auxiliar_reservas->reserva.id_reserva')), 'cantidad_reservas']
            ],
            include: [{
                model: Aux_grupo,
                attributes: [],
                include: [{
                    model: Auxiliar_reserva,
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
                }]
            }],
            group: ['usuarios.id_usuario'],
            order: [[sequelize.literal('cantidad_reservas'), 'DESC']],
            raw: true
        });

        const docentesFiltrados = docentes.filter(docente => docente.cantidad_reservas > 0);
        const top = docentesFiltrados.slice(0, 10);

        res.json(top);
    } catch (error) {
        console.error('Error al obtener el reporte de docentes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const getReservasAmbiente = async (req, res) => {
    try {
        const { id_ambiente } = req.params;

        const result = await sequelize.query(`
            SELECT R.id_reserva, LPAD(R.id_reserva::text, 3, '0') as id_reserva_lista, u.nombre_usuario, u.tipo_usuario,
                   r.fecha_reserva, r.registro_reserva, r.estado,r.motivo, p.hora_inicio, p.hora_fin,
                   string_agg(g.nombre_grupo, ', ' ORDER BY g.nombre_grupo) AS nombre_grupo,
                   string_agg(m.nombre_materia || ' - ' || g.nombre_grupo, ', ' ORDER BY m.nombre_materia) AS nombre_materia,
                   A.nombre_ambiente,
                   R.cantidad_total AS cantidad_est,
                   SUM(g.cantidad_est) AS cantidad_sumada,
                   A.capacidad,
                   A.porcentaje_min,
                   A.porcentaje_max,
                   FLOOR(A.capacidad * (A.porcentaje_min / 100.0)) AS min_capacidad,
                   FLOOR(A.capacidad * (A.porcentaje_max / 100.0)) AS max_capacidad
            FROM ambientes A
            JOIN disponibles D ON A.id_ambiente = D.ambiente_id
            JOIN periodos P ON D.periodo_id = P.id_periodo
            JOIN reservas R ON r.disponible_id = D.id_disponible
            JOIN auxiliar_reservas ar ON ar.reserva_id = R.id_reserva
            JOIN aux_grupos ag ON ar.aux_grupo_id = ag.id_aux_grupo
            JOIN grupos g ON g.id_grupo = ag.grupo_id
            JOIN materias m ON g.materia_id = m.id_materia
            JOIN usuarios u ON ag.usuario_id = u.id_usuario
            WHERE A.id_ambiente = :id_ambiente
            GROUP BY R.id_reserva, u.nombre_usuario, u.tipo_usuario,
                r.fecha_reserva, r.registro_reserva, r.estado,r.motivo, p.hora_inicio, p.hora_fin, A.nombre_ambiente, A.capacidad, A.porcentaje_min, A.porcentaje_max
            ORDER BY R.fecha_reserva DESC, R.registro_reserva DESC;
        `, {
            replacements: { id_ambiente },
            type: sequelize.QueryTypes.SELECT
        });

        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};