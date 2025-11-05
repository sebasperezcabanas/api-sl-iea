import { Router } from "express";
import {
  createAntenna,
  getAllAntennas,
  getAntennasByClient,
  getAntennaById,
  getAntennaByKitNumber,
  updateAntenna,
  activateAntenna,
  deactivateAntenna,
  registerInstallmentPayment,
  deleteAntenna,
} from "./antenna.controller.js";

const router = Router();

// Crear una nueva antenna
router.post("/", createAntenna);

// Obtener todas las antennas
router.get("/", getAllAntennas);

// Obtener antennas por cliente
router.get("/client/:clientId", getAntennasByClient);

// Obtener antenna por número de kit
router.get("/kit/:kitNumber", getAntennaByKitNumber);

// Obtener una antenna por ID
router.get("/:id", getAntennaById);

// Actualizar una antenna
router.put("/:id", updateAntenna);

// Activar una antenna
router.patch("/:id/activate", activateAntenna);

// Desactivar una antenna
router.patch("/:id/deactivate", deactivateAntenna);

// Registrar pago de cuota
router.patch("/:id/pay-installment", registerInstallmentPayment);

// Eliminar una antenna
router.delete("/:id", deleteAntenna);

export default router;
