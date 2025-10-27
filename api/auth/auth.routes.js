import { Router } from "express";
import { createUser, loginUser } from "./auth.controller.js";

const router = Router();

// Ruta para registro de usuarios
router.post("/register", createUser);

// Ruta para login de usuarios
router.post("/login", loginUser);

export default router;
