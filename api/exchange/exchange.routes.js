import express from "express";
import {
  getDolarCCLVenta,
  getDolarCCLCompleto,
} from "./exchange.controller.js";

const router = express.Router();

/**
 * GET /exchange/dolar-ccl/venta
 * Obtiene solo el valor de venta del dólar CCL
 */
router.get("/dolar-ccl/venta", getDolarCCLVenta);

/**
 * GET /exchange/dolar-ccl
 * Obtiene toda la información del dólar CCL
 */
router.get("/dolar-ccl", getDolarCCLCompleto);

export default router;
