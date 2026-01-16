import { Router } from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "./supplier.controller.js";

const router = Router();

// Crear un nuevo supplier
router.post("/", createSupplier);

// Obtener todos los suppliers
router.get("/", getAllSuppliers);

// Obtener un supplier por ID
router.get("/:id", getSupplierById);

// Actualizar un supplier
router.put("/:id", updateSupplier);

// Eliminar un supplier
router.delete("/:id", deleteSupplier);

export default router;
