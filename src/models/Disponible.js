import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Reserva } from './Reserva.js'


export const Disponible = sequelize.define('disponibles',{
    id_disponible:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dia:{
        type: DataTypes.STRING
    },
    habilitado:{
        type: DataTypes.BOOLEAN
    }

},{
    timestamps: false
});

Disponible.hasMany(Reserva,{
    foreignKey: 'disponible_id',
    sourceKey: 'id_disponible'
})

Reserva.belongsTo(Disponible,{
    foreignKey: 'disponible_id',
    targetId: 'id_disponible'
})
