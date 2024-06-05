import app from "./src/app.js";
import { sequelize } from "./src/database/database.js";

//import './src/models/Ambiente.js'
// import './src/models/Apertura.js'
// import './models/Aux_grupos.js'
// import './models/Auxiliar_reserva.js'
// './src/models/Disponible.js'
// import './models/Gestion.js'
// import './models/Grupo.js'
// import './models/Materia.js'
// import './models/Periodo.js'
//import './src/models/Reserva.js'
//import './src/models/Baja.js'
// import './models/Tipo_usuario.js'
//import './src/models/Usuario.js'
//import './src/models/Notificacion.js'
//import './src/models/Usuario.js'


async function main() {
    //await sequelize.sync({alter: true});
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });

}

main();