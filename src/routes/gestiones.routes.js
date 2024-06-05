import { Router } from "express";
import { createGestion, getGestion, deleteGestion, updateGestion, getGestiones } from '../controllers/gestiones.controller.js';

const router = Router();

router.get('/', getGestiones);
router.post('/', createGestion);
router.put('/:id_gestion', updateGestion);
router.delete('/:id_gestion', deleteGestion);
router.get('/:id_gestion', getGestion);

export default router;
