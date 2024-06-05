import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';
import moment from 'moment-timezone';  

export const Notificacion = sequelize.define('notificaciones', {
    id_notificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    registro: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP - interval \'4 hours\'')
    },
    descripcion: {
        type: DataTypes.STRING
    },
    leido: {
        type: DataTypes.BOOLEAN
    }
}, {
    timestamps: false,
    hooks: {
        beforeValidate: (notificacion, options) => {
            if (notificacion.descripcion) {
                notificacion.descripcion = notificacion.descripcion.toUpperCase();
            }
        }
    }
});
