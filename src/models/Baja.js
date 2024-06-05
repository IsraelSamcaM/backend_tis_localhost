import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'

export const Baja = sequelize.define('Bajas',{
    id_baja:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo:{
        type: DataTypes.STRING
    },
    registro_baja:{
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    estado_baja:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
   
},{
    timestamps: false,
    hooks: {
        beforeValidate: (baja, options) => {
            baja.motivo = baja.motivo.toUpperCase(); 
        }
    }
})


