import { Router } from "express";
import { getNotificaciones,getNotificacionesId,updateNotificacionLeido } from '../controllers/notificaciones.controller.js';

const router = Router();

router.get('/', getNotificaciones);
router.get('/:id_usuario', getNotificacionesId);
router.put('/update-leido/:id_notificacion', updateNotificacionLeido);

export default router;
