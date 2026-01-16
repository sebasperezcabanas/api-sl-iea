import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { JWT_SECRET } = config;

let io = null;

/**
 * Inicializar Socket.IO
 * @param {Object} server - Servidor HTTP
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // En producción, especifica el dominio exacto del frontend OJO ACA !!!
      methods: ["GET", "POST"],
    },
  });

  // Middleware para verificar autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token de autenticación requerido"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error("Token inválido o expirado"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id} (User: ${socket.userId})`);

    // El cliente se une a una sala según su rol
    socket.on("join", (data) => {
      const { userId, role } = data;

      // Verificar que el userId coincida con el del token
      if (userId !== socket.userId) {
        console.log(
          `⚠️ Intento de unirse con userId diferente al del token. Token: ${socket.userId}, Enviado: ${userId}`
        );
        return;
      }

      if (role === "admin") {
        socket.join("admins");
      } else {
        socket.join(`user_${userId}`);
      }
    });

    // Desconexión
    socket.on("disconnect", () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Obtener la instancia de Socket.IO
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO no ha sido inicializado");
  }
  return io;
};

/**
 * Emitir notificación de nueva solicitud a todos los administradores
 * @param {Object} request - Solicitud creada
 */
export const notifyAdminsNewRequest = (request) => {
  if (!io) return;

  const notification = {
    type: "new_request",
    message: `Nueva solicitud: ${getRequestTypeLabel(request.type)}`,
    request: {
      _id: request._id,
      type: request.type,
      status: request.status,
      antenna: request.antenna,
      plan: request.plan,
      newPlan: request.newPlan,
      client: request.client,
      processedBy: request.processedBy,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    },
    timestamp: new Date(),
  };

  io.to("admins").emit("notification", notification);
  console.log(
    `📢 Notificación enviada a administradores: Nueva solicitud ${request._id}`
  );
};

/**
 * Emitir notificación de actualización de solicitud al cliente
 * @param {String} clientId - ID del cliente
 * @param {Object} request - Solicitud actualizada
 */
export const notifyClientRequestUpdate = (clientId, request) => {
  if (!io) return;

  const notification = {
    type: "request_update",
    message: `Tu solicitud ha sido actualizada: ${getStatusLabel(
      request.status
    )}`,
    request: {
      _id: request._id,
      type: request.type,
      status: request.status,
      antenna: request.antenna,
      plan: request.plan,
      newPlan: request.newPlan,
      client: request.client,
      processedBy: request.processedBy,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    },
    timestamp: new Date(),
  };

  // Notificar al cliente
  io.to(`user_${clientId}`).emit("notification", notification);
  console.log(
    `📢 Notificación enviada al cliente ${clientId}: Solicitud actualizada`
  );

  // También notificar a los admins
  const adminNotification = {
    type: "request_update",
    message: `Solicitud ${request._id} actualizada`,
    request: {
      _id: request._id,
      type: request.type,
      status: request.status,
      antenna: request.antenna,
      plan: request.plan,
      newPlan: request.newPlan,
      client: request.client,
      processedBy: request.processedBy,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    },
    timestamp: new Date(),
  };

  io.to("admins").emit("notification", adminNotification);
  console.log(`📢 Notificación enviada a administradores: Solicitud actualizada`);
};

/**
 * Emitir notificación de cambio de estado de solicitud
 * @param {String} clientId - ID del cliente
 * @param {Object} request - Solicitud con estado actualizado
 */
export const notifyRequestStatusChange = (
  clientId,
  request,
  previousStatus
) => {
  if (!io) return;

  const notification = {
    type: "request_status_change",
    message: `El estado de tu solicitud cambió de "${getStatusLabel(
      previousStatus
    )}" a "${getStatusLabel(request.status)}"`,
    request: {
      _id: request._id,
      type: request.type,
      status: request.status,
      previousStatus,
      antenna: request.antenna,
      plan: request.plan,
      newPlan: request.newPlan,
      client: request.client,
      processedBy: request.processedBy,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    },
    timestamp: new Date(),
  };

  // Notificar al cliente
  io.to(`user_${clientId}`).emit("notification", notification);
  console.log(
    `📢 Notificación de cambio de estado enviada al cliente ${clientId}`
  );

  // También notificar a los admins
  const adminNotification = {
    type: "request_status_change",
    message: `Estado de solicitud ${request._id} cambió a "${getStatusLabel(request.status)}"`,
    request: {
      _id: request._id,
      type: request.type,
      status: request.status,
      previousStatus,
      antenna: request.antenna,
      plan: request.plan,
      newPlan: request.newPlan,
      client: request.client,
      processedBy: request.processedBy,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      comments: request.comments,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    },
    timestamp: new Date(),
  };

  io.to("admins").emit("notification", adminNotification);
  console.log(`📢 Notificación de cambio de estado enviada a administradores`);
};

/**
 * Obtener etiqueta legible del tipo de solicitud
 */
const getRequestTypeLabel = (type) => {
  const labels = {
    activate: "Activar antena",
    deactivate: "Desactivar antena",
    change_plan: "Cambiar plan",
  };
  return labels[type] || type;
};

/**
 * Obtener etiqueta legible del estado
 */
const getStatusLabel = (status) => {
  const labels = {
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completada",
  };
  return labels[status] || status;
};

export default {
  initializeSocket,
  getIO,
  notifyAdminsNewRequest,
  notifyClientRequestUpdate,
  notifyRequestStatusChange,
};
