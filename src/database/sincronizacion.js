import { sequelize } from "./database.js";

import '../models/Ambiente.js'
import '../models/Apertura.js'
import '../models/Aux_grupos.js'
import '../models/Auxiliar_reserva.js'
import '../models/Disponible.js'
import '../models/Gestion.js'
import '../models/Grupo.js'
import '../models/Materia.js'
import '../models/Periodo.js'
import '../models/Reserva.js'
import '../models/Baja.js'
import '../models/Usuario.js'
import '../models/Notificacion.js'

async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true }); // { force: true } si quieres forzar
        console.log("✅ Base de datos sincronizada correctamente.");
    } catch (error) {
        console.error("❌ Error al sincronizar la base de datos:", error);
    } finally {
        process.exit(); 
    }
}

syncDatabase();
