import { Router } from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";

const router = Router();

// Ruta para registro de usuarios
router.post("/register", createUser);

// Ruta para login de usuarios
router.post("/login", loginUser);

// Ruta para solicitar restablecimiento de contraseña
router.post("/forgot-password", forgotPassword);

// Ruta para restablecer contraseña con token
router.post("/reset-password", resetPassword);

// Obtener todos los usuarios
router.get("/users", getAllUsers);

// Obtener un usuario por ID
router.get("/users/:id", getUserById);

// Actualizar un usuario por ID
router.put("/users/:id", updateUser);

// Eliminar un usuario por ID
router.delete("/users/:id", deleteUser);

export default router;
