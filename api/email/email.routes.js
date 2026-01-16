import express from "express";
import { send, sendWelcome, sendRequestStatus } from "./email.controller.js";

const router = express.Router();

/**
 * POST /email/send
 * Envía un email personalizado
 * Body: { to, toName, subject, html, text, from?, fromName? }
 */
router.post("/send", send);

/**
 * POST /email/welcome
 * Envía un email de bienvenida
 * Body: { email, name }
 */
router.post("/welcome", sendWelcome);

/**
 * POST /email/request-status
 * Envía notificación de cambio de estado de solicitud
 * Body: { email, name, requestId, status }
 */
router.post("/request-status", sendRequestStatus);

export default router;
