import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Reserva } from './Reserva.js';

export const Apertura = sequelize.define('aperturas',{
    id_apertura:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo:{
        type: DataTypes.STRING
    },
    apertura_inicio:{
        type: DataTypes.DATE
    },
    apertura_fin:{
        type: DataTypes.DATE
    },
    apertura_hora_inicio:{
        type: DataTypes.TIME
    },
    apertura_hora_fin:{
        type: DataTypes.TIME
    },
    reserva_inicio:{
        type: DataTypes.DATE
    },
    reserva_fin:{
        type: DataTypes.DATE
    },
    docente:{
        type: DataTypes.BOOLEAN
    },
    auxiliar:{
        type: DataTypes.BOOLEAN
    },
    registro_apertura:{
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
},{
    timestamps: false,
    hooks: {
        beforeValidate: (apertura, options) => {
            apertura.motivo = apertura.motivo.toUpperCase();     
        }
    }
});

Apertura.hasMany(Reserva,{
    foreignKey: 'apertura_id',
    sourceKey: 'id_apertura'
})

Reserva.belongsTo(Apertura,{
    foreignKey: 'apertura_id',
    targetId: 'id_apertura'
})
