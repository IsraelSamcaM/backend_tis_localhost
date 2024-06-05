import { Router } from "express";
import {  obtenerDisponibilidadPorAmbiente} from '../controllers/disponibles.controller.js'

const router = Router();

router.get('/ambiente/:id_ambiente', obtenerDisponibilidadPorAmbiente)


export default router