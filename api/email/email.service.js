import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import config from "../config.js";
import {
  welcomeTemplate,
  requestStatusTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
} from "./templates/index.js";

// Inicializar MailerSend con la API key
const mailerSend = new MailerSend({
  apiKey: config.MAILERSEND_API_KEY,
});

/**
 * Envía un email utilizando MailerSend
 * @param {Object} emailData - Datos del email
 * @param {string} emailData.to - Email del destinatario
 * @param {string} emailData.toName - Nombre del destinatario
 * @param {string} emailData.subject - Asunto del email
 * @param {string} emailData.html - Contenido HTML del email
 * @param {string} emailData.text - Contenido en texto plano del email
 * @param {string} [emailData.from] - Email del remitente (opcional, usa default)
 * @param {string} [emailData.fromName] - Nombre del remitente (opcional, usa default)
 * @returns {Promise<Object>} Respuesta de MailerSend
 */
export const sendEmail = async (emailData) => {
  try {
    const {
      to,
      toName,
      subject,
      html,
      text,
      from = config.EMAIL_FROM,
      fromName = config.EMAIL_FROM_NAME,
    } = emailData;

    // Validar campos requeridos
    if (!to || !subject || (!html && !text)) {
      throw new Error(
        "Faltan campos requeridos: to, subject y al menos html o text"
      );
    }

    // Configurar remitente
    const sentFrom = new Sender(from, fromName);

    // Configurar destinatarios
    const recipients = [new Recipient(to, toName || to)];

    // Crear parámetros del email
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      // .setReplyTo(sentFrom)
      .setSubject(subject);

    // Agregar contenido HTML si existe
    if (html) {
      emailParams.setHtml(html);
    }

    // Agregar contenido de texto si existe
    if (text) {
      emailParams.setText(text);
    }

    // Enviar el email
    const response = await mailerSend.email.send(emailParams);

    return {
      success: true,
      message: "Email enviado correctamente",
      data: response,
    };
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

/**
 * Envía un email de bienvenida a un nuevo usuario
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  const { html, text } = welcomeTemplate(userName);

  return sendEmail({
    to: userEmail,
    toName: userName,
    fromName: config.EMAIL_FROM_NAME,
    subject: "¡Bienvenido a SL IEA!",
    html,
    text,
  });
};

/**
 * Envía notificación de cambio de estado de solicitud
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} requestId - ID de la solicitud
 * @param {string} newStatus - Nuevo estado de la solicitud
 */
export const sendRequestStatusEmail = async (
  userEmail,
  userName,
  requestId,
  newStatus
) => {
  const { html, text } = requestStatusTemplate(userName, requestId, newStatus);

  return sendEmail({
    to: userEmail,
    toName: userName,
    subject: `Actualización de Solicitud #${requestId}`,
    html,
    text,
  });
};

/**
 * Envía email para restablecer contraseña
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} resetUrl - URL con el token para restablecer contraseña
 */
export const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  const { html, text } = passwordResetTemplate(userName, resetUrl);

  return sendEmail({
    to: userEmail,
    toName: userName,
    subject: "Restablece tu contraseña - SL IEA",
    html,
    text,
  });
};

/**
 * Envía email de confirmación de cambio de contraseña
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 */
export const sendPasswordChangedEmail = async (userEmail, userName) => {
  const { html, text } = passwordChangedTemplate(userName);

  return sendEmail({
    to: userEmail,
    toName: userName,
    subject: "Contraseña actualizada - SL IEA",
    html,
    text,
  });
};
