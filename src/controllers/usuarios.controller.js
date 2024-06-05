import { Usuario } from '../models/Usuario.js';
import { Grupo } from '../models/Grupo.js'; // Asegúrate de importar el modelo de Grupo si lo necesitas
import { Materia } from '../models/Materia.js';
import { Aux_grupo } from '../models/Aux_grupos.js';
import {v4 as uuidv4 } from 'uuid'

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const usuario = await Usuario.findOne({ where: { id_usuario } });
        if (!usuario) return res.status(404).json({ message: "El usuario no existe" });
        res.json(usuario);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const createUsuario = async (req, res) => {
    const { nombre_usuario, contrasenia_usuario, email_usuario, tipo_usuario, codsiss } = req.body;
    try {
        const newUsuario = await Usuario.create({ nombre_usuario, contrasenia_usuario, email_usuario, tipo_usuario, codsiss });
        res.json(newUsuario);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { nombre_usuario, contrasenia_usuario, email_usuario, tipo_usuario, codsiss } = req.body;

        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) return res.status(404).json({ message: "El usuario no existe" });

        usuario.nombre_usuario = nombre_usuario;
        usuario.contrasenia_usuario = contrasenia_usuario;
        usuario.email_usuario = email_usuario;
        usuario.tipo_usuario = tipo_usuario;
        usuario.codsiss = codsiss;

        await usuario.save();

        res.json(usuario);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const deleteUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        await Usuario.destroy({ where: { id_usuario } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const getUsuarioGrupo = async (req, res) =>{
    const {id_usuario} = req.params
    const grupos = await Grupo.findAll({where:{usuario_id: id_usuario}})
    res.json(grupos)
}

// export const getMateriasGrupos = async (req, res) => {
//     const { id_usuario } = req.params;

//     try {
//         const gruposUsuario = await Grupo.findAll({
//             where: { usuario_id: id_usuario },
//             include: [
//                 {
//                     model: Materia,
//                     attributes: ['nombre_materia']
//                 }
//             ],
//             attributes: ['id_grupo', 'nombre_grupo', 'materia.nombre_materia']
//         });

//         if (!gruposUsuario || gruposUsuario.length === 0) {
//             return res.status(404).json({ message: 'Usuario no encontrado o no tiene grupos asociados' });
//         }

//         const gruposConMateria = gruposUsuario.map(grupo => ({
//             id_grupo: grupo.id_grupo,
//             nombre_grupo: grupo.nombre_grupo,
//             nombre_materia: grupo.materia ? grupo.materia.nombre_materia : null
//         }));

//         res.json(gruposConMateria);
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };


export const getMateriasGrupos = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const usuario = await Usuario.findOne({
            where: { id_usuario },
            attributes: ['id_usuario', 'nombre_usuario', 'contrasenia_usuario', 'email_usuario', 'tipo_usuario', 'codsiss', 'disponible'],
            include: [{
                model: Aux_grupo,
                include: [{
                    model: Grupo,
                    include: [{
                        model: Materia,
                        attributes: ['nombre_materia']
                    }],
                    attributes: ['id_grupo', 'nombre_grupo', 'cantidad_est'],
                }],
                attributes: ['id_aux_grupo']
            }]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const gruposConMateria = usuario.aux_grupos.map(auxGrupo => ({
            id_aux_grupo: auxGrupo.id_aux_grupo,
            id_grupo: auxGrupo.grupo.id_grupo,
            nombre_grupo: auxGrupo.grupo.nombre_grupo,
            nombre_materia: auxGrupo.grupo.materia ? auxGrupo.grupo.materia.nombre_materia : null,
            cantidad_est: auxGrupo.grupo.cantidad_est
        }));



        const respuestaFinal = ({
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            contrasenia_usuario: usuario.contrasenia_usuario,
            email_usuario: usuario.email_usuario,
            tipo_usuario: usuario.tipo_usuario,
            codsiss: usuario.codsiss,
            disponible: usuario.disponible,
            'materia_grupo': gruposConMateria
        });

        //const materiasComunes =  getMateriasComunes(respuestaFinal)

        res.json(respuestaFinal)


    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// {
//     "id_solicitantes":[2,6]
// }
   

export const getMateriasAsociados = async (req, res) => {
    const { id_solicitantes } = req.body;

    try {
        const usuarios = await Usuario.findAll({
            where: { id_usuario: id_solicitantes },
            include: [{
                model: Aux_grupo,
                include: [{
                    model: Grupo,
                    include: [{
                        model: Materia,
                        attributes: ['nombre_materia', 'id_materia']
                    }],
                    attributes: ['id_grupo', 'nombre_grupo', 'cantidad_est'],
                }],
                attributes: ['id_aux_grupo']
            }],
            attributes: ['id_usuario', 'tipo_usuario'] 
        });

        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuarios no encontrados' });
        }

        let respuesta = [];

        if (id_solicitantes.length === 1) {
            respuesta = usuarios.flatMap(usuario =>
                usuario.aux_grupos.map(auxGrupo => ({
                    id_usuario: usuario.id_usuario,
                    id_aux_grupo: auxGrupo.id_aux_grupo,
                    id_grupo: auxGrupo.grupo.id_grupo,
                    nombre_grupo: auxGrupo.grupo.nombre_grupo,
                    id_materia: auxGrupo.grupo.materia.id_materia,
                    nombre_materia: auxGrupo.grupo.materia ? auxGrupo.grupo.materia.nombre_materia : null,
                    cantidad_est: auxGrupo.grupo.cantidad_est
                }))
            );
        } else {
            const materiasUsuario1 = usuarios[0].aux_grupos.map(auxGrupo => auxGrupo.grupo.materia.nombre_materia);
            const materiasUsuario2 = usuarios[1].aux_grupos.map(auxGrupo => auxGrupo.grupo.materia.nombre_materia);

            const materiasComunes = materiasUsuario1.filter(materia => materiasUsuario2.includes(materia));

            if (materiasComunes.length > 0) {
                respuesta = usuarios.flatMap(usuario =>
                    usuario.aux_grupos.filter(auxGrupo =>
                        materiasComunes.includes(auxGrupo.grupo.materia.nombre_materia)
                    ).map(auxGrupo => {
                        const nombreGrupo = usuario.tipo_usuario === "AUXILIAR" ? `${auxGrupo.grupo.nombre_grupo} (AUXILIATURA)` : auxGrupo.grupo.nombre_grupo;
                        return {
                            id_usuario: usuario.id_usuario,
                            id_aux_grupo: auxGrupo.id_aux_grupo,
                            id_grupo: auxGrupo.grupo.id_grupo,
                            nombre_grupo: nombreGrupo,
                            id_materia: auxGrupo.grupo.materia.id_materia,
                            nombre_materia: auxGrupo.grupo.materia.nombre_materia,
                            cantidad_est: auxGrupo.grupo.cantidad_est
                        };
                    })
                );
            }
        }

        res.json(respuesta);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};






export const validarUsuario = async (req, res) => {
    try {
        const { codsiss, contrasenia_usuario } = req.body;

        const usuario = await Usuario.findOne({
            where: {
                codsiss,
                contrasenia_usuario,
            },
        });

        if (!usuario) {
            return res.json({ estado: 'failed' });
        }
        const token = uuidv4();

        const usuarioFormateado = {
            estado: 'successful',
            usuario: {
                id_usuario: usuario.id_usuario,
                token,
                nombre_usuario: usuario.nombre_usuario,
                email_usuario: usuario.email_usuario,
                tipo_usuario: usuario.tipo_usuario,
                codsiss: usuario.codsiss,
                disponible: usuario.disponible,
                ci_usuario: usuario.ci_usuario,
                foto_usuario: usuario.foto_usuario,
            },
        };

        res.json(usuarioFormateado);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




