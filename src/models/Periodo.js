import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Disponible } from './Disponible.js'


export const Periodo = sequelize.define('periodos',{
    id_periodo:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_periodo:{
        type: DataTypes.STRING
    },
    hora_inicio:{
        type: DataTypes.TIME
    },
    hora_fin:{
        type: DataTypes.TIME
    }
},{
    timestamps: false
});

Periodo.hasMany(Disponible,{
    foreignKey: 'periodo_id',
    sourceKey: 'id_periodo'
})

Disponible.belongsTo(Periodo,{
    foreignKey: 'periodo_id',
    targetId: 'id_periodo'
})