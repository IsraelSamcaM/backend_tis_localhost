import { Notificacion } from '../models/Notificacion.js';
import moment from 'moment';

const fechaFormateada = (dateString) => {
    return moment.utc(dateString).format('HH:mm DD-MM-YYYY');
};

export const getNotificaciones = async (req, res) => {
    try {
        const notificaciones = await Notificacion.findAll({
            order: [['registro', 'DESC']],
        });
        
        const formateados = notificaciones.map(notificacion => {
            return { ...notificacion, registro: fechaFormateada(notificacion.registro) };
        });
        
        res.json(formateados);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getNotificacionesId = async (req, res) => {
    try {
        const {id_usuario} = req.params

        const notificaciones = await Notificacion.findAll({
            where: {usuario_id : id_usuario},
            order: [['registro', 'DESC']],
        });

        const formateados = notificaciones.map(notificacion => {
            return {
                id_notificacion: notificacion.id_notificacion,
                descripcion: notificacion.descripcion,
                leido: notificacion.leido,
                usuario_id: notificacion.usuario_id,
                registro: fechaFormateada(notificacion.registro)
            };
        });
        
        res.json(formateados);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const updateNotificacionLeido = async (req, res) => {
    try {
        const { id_notificacion } = req.params;

        const notificacion = await Notificacion.findByPk(id_notificacion);

        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        notificacion.leido = true;
        await notificacion.save();

        res.json({ message: 'Notificación actualizada correctamente', notificacion });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};