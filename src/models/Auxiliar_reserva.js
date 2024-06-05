import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'


export const Auxiliar_reserva = sequelize.define('auxiliar_reservas',{
    id_auxiliar_reserva:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
},{
    timestamps: false
});


