import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Apertura } from './Apertura.js'

export const Gestion = sequelize.define('gestiones',{
    id_gestion:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    anio:{
        type: DataTypes.INTEGER
    },
    semestre:{
        type: DataTypes.INTEGER
    }
},{
    timestamps: false
});

