import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import authRoutes from "./auth/auth.routes.js";
import connectDB from "./db/database.js";
import config from "./config.js";
import cors from "cors";

const PORT = config.PORT;

const app = express();
app.use(express.json());
app.use(cors()); // para permitir solicitudes desde otros dominios

connectDB();

app.use("/", authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor API SL IEA corriendo en puerto ${PORT}`);
});
