import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'

import { Auxiliar_reserva } from './Auxiliar_reserva.js' 

export const Aux_grupo = sequelize.define('aux_grupos',{
    id_aux_grupo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
},{
    timestamps: false
})

Aux_grupo.hasMany(Auxiliar_reserva,{
    foreignKey: 'aux_grupo_id',
    sourceKey: 'id_aux_grupo'
})

Auxiliar_reserva.belongsTo(Aux_grupo,{
    foreignKey: 'aux_grupo_id',
    targetId: 'id_aux_grupo'
})
