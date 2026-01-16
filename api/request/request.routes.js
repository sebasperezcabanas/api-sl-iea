import { Router } from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  getRequestsByClient,
  getRequestsByStatus,
  getRequestsByType,
  updateRequest,
  updateRequestStatus,
  deleteRequest,
  getPendingRequestsByClient,
  getRequestStats,
} from "./request.controller.js";

const router = Router();

// Crear una nueva solicitud
router.post("/", createRequest);

// Obtener todas las solicitudes (con filtros opcionales via query params)
router.get("/", getAllRequests);

// Obtener estadísticas de solicitudes
router.get("/stats", getRequestStats);

// Obtener solicitudes por cliente
router.get("/client/:clientId", getRequestsByClient);

// Obtener solicitudes pendientes por cliente
router.get("/client/:clientId/pending", getPendingRequestsByClient);

// Obtener solicitudes por estado
router.get("/status/:status", getRequestsByStatus);

// Obtener solicitudes por tipo
router.get("/type/:type", getRequestsByType);

// Obtener una solicitud por ID
router.get("/:id", getRequestById);

// Actualizar una solicitud
router.put("/:id", updateRequest);

// Cambiar el estado de una solicitud
router.patch("/:id/status", updateRequestStatus);

// Eliminar una solicitud
router.delete("/:id", deleteRequest);

export default router;
