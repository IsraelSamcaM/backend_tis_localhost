import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Auxiliar_reserva } from './Auxiliar_reserva.js' 
import { Aux_grupo } from './Aux_grupos.js' 


export const Grupo = sequelize.define('grupos',{
    id_grupo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_grupo:{
        type: DataTypes.STRING
    },
    docente:{
        type: DataTypes.STRING
    },
    cantidad_est:{
        type: DataTypes.INTEGER
    }
},{
    timestamps: false,
    hooks: {
        beforeValidate: (grupo, options) => {
            grupo.nombre_grupo = grupo.nombre_grupo.toUpperCase(); 
            grupo.docente = grupo.docente.toUpperCase(); 

        }
    }
})




Grupo.hasMany(Aux_grupo,{
    foreignKey: 'grupo_id',
    sourceKey: 'id_grupo'
})

Aux_grupo.belongsTo(Grupo,{
    foreignKey: 'grupo_id',
    targetId: 'id_grupo'
})