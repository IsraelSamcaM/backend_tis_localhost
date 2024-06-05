import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';
import { Auxiliar_reserva } from './Auxiliar_reserva.js' 

export const Reserva = sequelize.define('reservas',{
    id_reserva:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo:{
        type: DataTypes.STRING
    },
    cantidad_total:{
        type: DataTypes.INTEGER
    },
    fecha_reserva:{
        type: DataTypes.DATE
    },
    hora:{
        type: DataTypes.TIME,
        defaultValue: sequelize.literal('CURRENT_TIME') 
    },
    fecha:{
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    estado:{
        type: DataTypes.STRING,
    },
    registro_reserva: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
},{
    timestamps: false
});

Reserva.hasMany(Auxiliar_reserva,{
    foreignKey: 'reserva_id',
    sourceKey: 'id_reserva'
})

Auxiliar_reserva.belongsTo(Reserva,{
    foreignKey: 'reserva_id',
    targetId: 'id_reserva'
})