import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "TIS_RESERBIT", // Nombre de la base de datos
  "postgres", // Nombre de usuario
  "13033162", // Contraseña
  {
    host: "localhost", // Host de la base de datos en Railway
    dialect: "postgres", // Dialecto PostgreSQL
    port: 5432, // Puerto personalizado
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
