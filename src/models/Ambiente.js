import {DataTypes} from 'sequelize'
import { sequelize } from '../database/database.js'
import { Disponible } from './Disponible.js'
import { Baja } from './Baja.js';
 
export const Ambiente = sequelize.define('ambientes',{
    id_ambiente:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_ambiente:{
        type: DataTypes.STRING
    },
    tipo:{
        type: DataTypes.STRING
    },
    capacidad:{
        type: DataTypes.INTEGER
    },
    disponible:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    computadora:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    proyector:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ubicacion:{
        type: DataTypes.STRING

    },

    actualizacion:{
        type: DataTypes.DATE
    },
    
    // foto:{
    //     type: DataTypes.STRING
    // },
    
    porcentaje_min:{
        type: DataTypes.INTEGER
    },
    porcentaje_max:{
        type: DataTypes.INTEGER
    },
},{
    timestamps: false,
    hooks: {
        beforeValidate: (ambiente, options) => {
            ambiente.nombre_ambiente = ambiente.nombre_ambiente.toUpperCase();       
        }
    }
});

Ambiente.hasMany(Disponible,{
    foreignKey: 'ambiente_id',
    sourceKey: 'id_ambiente'
})

Disponible.belongsTo(Ambiente,{
    foreignKey: 'ambiente_id',
    targetId: 'id_ambiente'
})

Ambiente.hasMany(Baja,{
    foreignKey: 'ambiente_id',
    sourceKey: 'id_ambiente'
})

Baja.belongsTo(Ambiente,{
    foreignKey: 'ambiente_id',
    targetId: 'id_ambiente'
})