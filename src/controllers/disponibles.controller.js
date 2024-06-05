

import { Disponible  } from '../models/Disponible.js';
import { Periodo } from '../models/Periodo.js';
import { Ambiente  } from '../models/Ambiente.js';

export const obtenerDisponibilidadPorAmbiente = async (req, res) => {
  const { id_ambiente } = req.params;

  try {
      const ambiente = await Ambiente.findByPk(id_ambiente);
      if (!ambiente) {
          return res.status(404).json({ mensaje: 'Ambiente no encontrado' });
      }

      const disponibilidadPorDia = [];
      const disponibles = await Disponible.findAll({
          where: { ambiente_id: id_ambiente, habilitado: true },
          include: [{
              model: Periodo,
              attributes: ['id_periodo', 'nombre_periodo', 'hora_inicio', 'hora_fin']
          }],
          order: [['dia', 'ASC']]
      });

      const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      dias.forEach(dia => {
          const periodos = disponibles.filter(disponible => disponible.dia === dia)
              .map(disponible => ({
                  id_periodo: disponible.periodo.id_periodo,
                  periodo: disponible.periodo.nombre_periodo,
                  hora_inicio: disponible.periodo.hora_inicio,
                  hora_fin: disponible.periodo.hora_fin
              }))
              .sort((a, b) => {
                  return a.hora_inicio.localeCompare(b.hora_inicio);
              });
          disponibilidadPorDia.push({ dia, periodos });
      });

      // Formatear respuesta
      const respuesta = {
          id_ambiente: ambiente.id_ambiente,
          nombre_ambiente: ambiente.nombre_ambiente,
          tipo: ambiente.tipo,
          capacidad: ambiente.capacidad,
          capacidad_min: Math.floor(ambiente.capacidad * (ambiente.porcentaje_min / 100)),
          capacidad_max: Math.floor(ambiente.capacidad * (ambiente.porcentaje_max / 100)),
          disponible: ambiente.disponible,
          computadora: ambiente.computadora,
          proyector: ambiente.proyector,
          ubicacion: ambiente.ubicacion,
          porcentaje_min: ambiente.porcentaje_min,
          porcentaje_max: ambiente.porcentaje_max,
          disponibilidadPorDia
      };

      res.json(respuesta);
  } catch (error) {
      console.error('Error al obtener la disponibilidad del ambiente:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};



