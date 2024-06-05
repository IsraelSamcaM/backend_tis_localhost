import express from "express";
import cors from "cors"
//import morgan from "morgan";

const app = express();

var corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions));

//Import routes
import ambientesRoutes from "./routes/ambientes.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import gestionesRoutes from "./routes/gestiones.routes.js";
import materiasRoutes from "./routes/materias.routes.js";
import periodosRoutes from "./routes/periodos.routes.js";
import gruposRoutes from "./routes/grupos.routes.js";
import disponiblesRoutes from "./routes/disponibles.routes.js";
import aperturasRoutes from "./routes/aperturas.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";

// Middlewares

app.use(express.json());

app.use(cors());

app.use(express.urlencoded({ extended: true }));
// Routes
//app.use(ambientesRoutes);
app.use("/api/ambientes", ambientesRoutes );
app.use("/api/usuarios", usuariosRoutes );
app.use("/api/gestiones", gestionesRoutes );
app.use("/api/materias", materiasRoutes );
app.use("/api/periodos", periodosRoutes );
app.use("/api/grupos", gruposRoutes );
app.use("/api/disponibles", disponiblesRoutes );
app.use("/api/aperturas",aperturasRoutes);
app.use("/api/reservas",reservasRoutes);
app.use("/api/notificaciones",notificacionesRoutes);

app.get("/", (req, res) => {
    res.json({ message: {
        title: "¡Bienvenido al backend para TIS!",
        description: "Gracias por usar nuestros servicios."
    }});
});

export default app;