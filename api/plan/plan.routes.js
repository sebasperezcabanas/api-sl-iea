import { Router } from "express";
import {
  createPlan,
  getAllPlans,
  getPlansBySupplier,
  getPlanById,
  updatePlan,
  deletePlan,
} from "./plan.controller.js";

const router = Router();

// Crear un nuevo plan
router.post("/", createPlan);

// Obtener todos los planes
router.get("/", getAllPlans);

// Obtener planes por supplier
router.get("/supplier/:supplierId", getPlansBySupplier);

// Obtener un plan por ID
router.get("/:id", getPlanById);

// Actualizar un plan
router.put("/:id", updatePlan);

// Eliminar un plan
router.delete("/:id", deletePlan);

export default router;
