import {
  sendEmail,
  sendWelcomeEmail,
  sendRequestStatusEmail,
} from "./email.service.js";

/**
 * Controlador para enviar un email personalizado
 */
export const send = async (req, res) => {
  try {
    const { to, toName, subject, html, text, from, fromName, cc } = req.body;

    // Validar campos requeridos
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        error: "Faltan campos requeridos: to, subject y al menos html o text",
      });
    }

    const result = await sendEmail({
      to,
      toName,
      subject,
      html,
      text,
      from,
      fromName,
      cc,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en email.controller.send:", error);
    res.status(500).json({
      error: "Error al enviar el email",
      details: error.message,
    });
  }
};

/**
 * Controlador para enviar email de bienvenida
 */
export const sendWelcome = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: "Faltan campos requeridos: email y name",
      });
    }

    const result = await sendWelcomeEmail(email, name);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en email.controller.sendWelcome:", error);
    res.status(500).json({
      error: "Error al enviar el email de bienvenida",
      details: error.message,
    });
  }
};

/**
 * Controlador para enviar notificación de cambio de estado de solicitud
 */
export const sendRequestStatus = async (req, res) => {
  try {
    const { email, name, requestId, status } = req.body;

    if (!email || !name || !requestId || !status) {
      return res.status(400).json({
        error: "Faltan campos requeridos: email, name, requestId y status",
      });
    }

    const result = await sendRequestStatusEmail(email, name, requestId, status);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en email.controller.sendRequestStatus:", error);
    res.status(500).json({
      error: "Error al enviar la notificación de estado",
      details: error.message,
    });
  }
};
