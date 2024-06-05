import { Router } from "express";
import {createUsuario, getUsuario, getUsuarios, 
        updateUsuario, deleteUsuario, getUsuarioGrupo, 
        getMateriasGrupos,getMateriasAsociados,validarUsuario} from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', getUsuarios);
router.get('/:id_usuario', getUsuario);

router.post('/', createUsuario);
router.put('/:id_usuario', updateUsuario);
router.delete('/:id_usuario', deleteUsuario);
router.get('/:id_usuario/materias-grupos', getMateriasGrupos);

router.post('/materias-grupos-asociados', getMateriasAsociados);
router.post('/validar-usuario',validarUsuario);



router.get('/:id_usuario/grupo', getUsuarioGrupo);

export default router;
