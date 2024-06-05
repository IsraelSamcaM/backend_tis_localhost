import { Router } from "express";
import {
    createAmbiente, getAmbiente, deleteAmbiente, updateAmbiente,
    getAmbientes, createAmbienteCompleto, editarAmbienteCompleto, 
    registrarBaja, registrarAlta, reporteAmbientes
} from '../controllers/ambientes.controller.js'

const router = Router();

router.get('/', getAmbientes)
router.post('/', createAmbiente)
router.post('/completo', createAmbienteCompleto)

//router.post('/:tipo_ambiente/grupo/:id_grupo/fecha/:fecha', createAmbiente)
//PENSAR QUE SOPORTE LA FECHA


router.put('/:id_ambiente', updateAmbiente)
router.post('/editar-completo', editarAmbienteCompleto)
router.post('/editar-disponibilidad', registrarBaja)

router.delete('/:id_ambiente', deleteAmbiente)
router.get('/:id_ambiente', getAmbiente)

router.put('/editar-disponibilidad/:id_ambiente', registrarAlta)
router.post('/reporte-ambientes', reporteAmbientes);



export default router