import express from "express";
import { createServer } from "http";
import authRoutes from "./auth/auth.routes.js";
import supplierRoutes from "./supplier/supplier.routes.js";
import planRoutes from "./plan/plan.routes.js";
import antennaRoutes from "./antenna/antenna.routes.js";
import requestRoutes from "./request/request.routes.js";
import emailRoutes from "./email/email.routes.js";
import connectDB from "./db/database.js";
import config from "./config.js";
import cors from "cors";
import { initializeSocket } from "./socket/socket.service.js";

const PORT = config.PORT;

const app = express();
const httpServer = createServer(app);

// Inicializar Socket.IO
const io = initializeSocket(httpServer);

app.use(express.json());
app.use(cors()); // para permitir solicitudes desde otros dominios

connectDB();

// Rutas de autenticación
app.use("/auth", authRoutes);

// Rutas de suppliers
app.use("/suppliers", supplierRoutes);

// Rutas de planes
app.use("/plans", planRoutes);

// Rutas de antennas
app.use("/antennas", antennaRoutes);

// Rutas de solicitudes
app.use("/requests", requestRoutes);

// Rutas de email
app.use("/email", emailRoutes);

// Ruta raíz para verificar que la API está funcionando
app.get("/", (req, res) => {
  res.json({
    message: "API SL IEA - Sistema de Gestión de Antenas",
    version: "1.0.0",
    endpoints: {
      auth: "/auth (register, login)",
      suppliers: "/suppliers",
      plans: "/plans",
      antennas: "/antennas",
      requests: "/requests",
      email: "/email (send, welcome, request-status)",
    },
    websocket: "Socket.IO habilitado para notificaciones en tiempo real",
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor API SL IEA corriendo en puerto ${PORT}`);
  console.log(`WebSocket Server listo para conexiones`);
});
