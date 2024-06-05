import { Grupo } from '../models/Grupo.js';
import { Materia } from '../models/Materia.js';
import { Usuario } from '../models/Usuario.js';
import { Aux_grupo } from '../models/Aux_grupos.js';

export const getGrupos = async (req, res) => {
    try {
        const grupos = await Grupo.findAll();
        res.json(grupos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getTablaMaterias = async (req, res) => {
    try {
        const grupos = await Grupo.findAll({
            include: {
                model: Materia
            }
        });

        const gruposFormateados = grupos.map((grupo, index) => ({
            numero: index+1,
            id_grupo: grupo.id_grupo,
            nombre_grupo: grupo.nombre_grupo,
            docente: grupo.docente,
            cantidad_est: grupo.cantidad_est,
            usuario_id: grupo.usuario_id,
            materia_id: grupo.materia_id,
            nombre_materia: grupo.materia?.nombre_materia || 'Sin materia asignada', 
            nivel_materia: grupo.materia?.nivel_materia || 'Sin nivel asignado'

        }));

        gruposFormateados.sort((a, b) => {
            if (a.nivel_materia > b.nivel_materia) return 1;
            if (a.nivel_materia < b.nivel_materia) return -1;

            if (a.nombre_materia > b.nombre_materia) return 1;
            if (a.nombre_materia < b.nombre_materia) return -1;

            return 0;
        });

        res.json(gruposFormateados);
    } catch (error){
        return res.status(500).json({message: error.message });
    }
};

export const getTablaMateriasId = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const usuario = await Usuario.findByPk(id_usuario);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        let grupos;

        if (usuario.tipo_usuario === 'ADMINISTRADOR') {
            grupos = await Grupo.findAll({
                include: [
                    {
                        model: Aux_grupo,
                        include: [
                            {
                                model: Usuario,
                            },
                        ],
                    },
                    {
                        model: Materia,
                    },
                ],
            });
        } else {
            grupos = await Grupo.findAll({
                include: [
                    {
                        model: Aux_grupo,
                        include: [
                            {
                                model: Usuario,
                                where: { id_usuario: id_usuario },
                            },
                        ],
                    },
                    {
                        model: Materia,
                    },
                ],
            });
        }

        grupos = grupos.filter((grupo) => grupo.aux_grupos.length > 0);

        const gruposFormateados = grupos.map((grupo, index) => ({
            numero: index + 1,
            id_grupo: grupo.id_grupo,
            nombre_grupo: grupo.nombre_grupo,
            docente: grupo.aux_grupos[0].usuario.tipo_usuario === 'AUXILIAR' ? grupo.aux_grupos[0].usuario.nombre_usuario + ' (AUXILIAR)':grupo.aux_grupos[0].usuario.nombre_usuario || 'Sin docente asignado',
            cantidad_est: grupo.cantidad_est,
            usuario_id: grupo.aux_grupos[0].usuario.id_usuario || 'Sin docente asignado',
            materia_id: grupo.materia.id_materia,
            nombre_materia: grupo.aux_grupos[0].usuario.tipo_usuario === 'AUXILIAR' ? grupo.materia.nombre_materia + ' (*)' : grupo.materia.nombre_materia || 'Sin materia asignada',
            nivel_materia: grupo.materia.nivel_materia || 'Sin nivel asignado',
        }));

        gruposFormateados.sort((a, b) => {
            if (a.nivel_materia > b.nivel_materia) return 1;
            if (a.nivel_materia < b.nivel_materia) return -1;

            if (a.nombre_materia > b.nombre_materia) return 1;
            if (a.nombre_materia < b.nombre_materia) return -1;

            return 0;
        });

        res.json(gruposFormateados);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};










export const getGrupo = async (req, res) => {
    try {
        const { id_grupo } = req.params;
        const grupo = await Grupo.findOne({ where: { id_grupo } });
        res.json(grupo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createGrupo = async (req, res) => {
    const { nombre_grupo, cantidad_est, materia_id, usuario_id, docente } = req.body;
    try {
        const newGrupo = await Grupo.create({ nombre_grupo, cantidad_est,materia_id, usuario_id, docente  });
        res.json(newGrupo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateGrupo = async (req, res) => {
    try {
        const { id_grupo } = req.params;

        const grupo = await Grupo.findByPk(id_grupo);
        grupo.set(req.body)
        await grupo.save();
        res.json(grupo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteGrupo = async (req, res) => {
    try {
        const { id_grupo } = req.params;
        await Grupo.destroy({ where: { id_grupo } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
