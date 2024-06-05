import { Materia } from '../models/Materia.js';
import { Aux_grupo } from '../models/Aux_grupos.js';

import { Grupo } from '../models/Grupo.js';
import { Usuario } from '../models/Usuario.js';
import { sequelize } from '../database/database.js';
import xlsx from 'xlsx';

export const getMaterias = async (req, res) => {
    try {
        const materias = await Materia.findAll();
        res.json(materias);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMateria = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const materia = await Materia.findOne({ where: { id_materia } });
        if (!materia) return res.status(404).json({ message: "La materia no existe" });
        res.json(materia);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createMateria = async (req, res) => {
    const { nombre_materia, nivel_materia } = req.body;
    try {
        const newMateria = await Materia.create({ nombre_materia, nivel_materia });
        res.json(newMateria);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateMateria = async (req, res) => {
    try {
        const { id_materia } = req.params;
        const { nombre_materia, nivel_materia } = req.body;

        const materia = await Materia.findByPk(id_materia);
        materia.nombre_materia = nombre_materia;
        materia.nivel_materia = nivel_materia;

        await materia.save();

        res.json(materia);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteMateria = async (req, res) => {
    try {
        const { id_materia } = req.params;
        await Materia.destroy({ where: { id_materia } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const cargarMaterias = async (req, res) => {
  const { id_usuario } = req.params;
  const datos = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'mana existinkichu sistema waway' });
    }
    
    const gruposCreados = [];
    const transaction = await sequelize.transaction();

    try {
      for (const dato of datos) {
        const { materia, nivel, grupo, docente, n_estudiantes } = dato;
        if (!materia || !nivel || !grupo || !docente || n_estudiantes === undefined) {
          return res.status(400).json({ message: 'CARAJO FIJATE BIEN EL EXCEL' });
        }
        const [materiaInstance, createdMateria] = await Materia.findOrCreate({
          where: { nombre_materia: dato.materia, nivel_materia: dato.nivel },
          defaults: { nombre_materia: dato.materia, nivel_materia: dato.nivel },
          transaction, 
        });

        if (createdMateria) {
          console.log(`Se creó una nueva materia: ${materiaInstance.nombre_materia} (${materiaInstance.nivel_materia})`);
        }

        const grupos = await Grupo.create(
          {
            nombre_grupo: dato.grupo,
            docente: dato.docente,
            cantidad_est: dato.n_estudiantes,
            materia_id: materiaInstance.id_materia,
            usuario_id: usuario.id_usuario,
          },
          { transaction } 
        );

        gruposCreados.push(grupos);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error; 
    }

    res.json(gruposCreados);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

///////////////////LEER ARCHIVO ESCEL//////////////////////

export const uploadExcel = async (req, res) => {
    console.log('req.file:', req.file);
    try {
        // Verifica si se proporcionó un archivo
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se proporcionó ningún archivo' });
        }
        // Lee el archivo de Excel
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        const worksheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(worksheet);
        
        console.log('Datos de Excel:', excelData);
        
        return res.json({ excelData });
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante el proceso de lectura del archivo de Excel
        return res.status(500).json({ message: 'Error al leer archivo Excel', error: error.message });
    }
};

export const materiaUsuario = async (req, res) => {
  try {
    const { id_materia } = req.params;

    const result = await Materia.findOne({
      where: { id_materia: id_materia },
      include: [
        {
          model: Grupo,
          attributes: ['id_grupo', 'nombre_grupo', 'cantidad_est'], 
          include: [
            {
              model: Aux_grupo,
              attributes: ['id_aux_grupo'], 
              include: [
                {
                  model: Usuario,
                  attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario'], 
                }
              ]
            }
          ]
        }
      ]
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

