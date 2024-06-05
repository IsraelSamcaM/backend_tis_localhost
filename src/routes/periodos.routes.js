import { Router } from "express";
import { createPeriodo, getPeriodo, deletePeriodo, updatePeriodo, getPeriodos } from '../controllers/periodos.controller.js';

const router = Router();

router.get('/', getPeriodos);
router.post('/', createPeriodo);
router.put('/:id_periodo', updatePeriodo);
router.delete('/:id_periodo', deletePeriodo);
router.get('/:id_periodo', getPeriodo);

export default router;
