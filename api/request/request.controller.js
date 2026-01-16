import Request from "./request.dao.js";
import Antenna from "../antenna/antenna.dao.js";
import Plan from "../plan/plan.dao.js";
import {
  notifyAdminsNewRequest,
  notifyClientRequestUpdate,
  notifyRequestStatusChange,
} from "../socket/socket.service.js";
import { REQUEST_TYPES } from "./request.constants.js";

/**
 * Crear una nueva solicitud
 */
export const createRequest = async (req, res) => {
  try {
    const { type, client, antenna, plan, status, comments } = req.body;

    // Validar campos requeridos
    if (!type || !client) {
      return res.status(400).json({
        message: "Type y client son requeridos",
      });
    }

    // Validar que el tipo de solicitud sea válido
    const validTypes = Object.values(REQUEST_TYPES);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Tipo de solicitud inválido. Debe ser uno de: ${validTypes.join(
          ", "
        )}`,
      });
    }

    // Validaciones específicas por tipo
    if (
      [
        REQUEST_TYPES.ACTIVATE,
        REQUEST_TYPES.DEACTIVATE,
        REQUEST_TYPES.CHANGE_PLAN,
      ].includes(type) &&
      !antenna
    ) {
      return res.status(400).json({
        message:
          "Para solicitudes de antena se requiere especificar una antena",
      });
    }

    // Para change_plan, el plan ahora es opcional (puede especificarse en comentarios)

    // Verificar que la antena existe (si aplica)
    if (antenna) {
      const antennaExists = await Antenna.findById(antenna);
      if (!antennaExists) {
        return res.status(404).json({
          message: "La antena especificada no existe",
        });
      }
    }

    // Verificar que el plan existe (si aplica)
    if (plan) {
      const planExists = await Plan.findById(plan);
      if (!planExists) {
        return res.status(404).json({
          message: "El plan especificado no existe",
        });
      }
    }

    // Crear solicitud
    const requestData = {
      type,
      client,
      antenna,
      plan,
      comments,
    };

    // Agregar status si se proporciona
    if (status) requestData.status = status;

    const createdRequest = await Request.create(requestData);

    // Obtener la solicitud completa con los datos poblados
    const request = await Request.findById(createdRequest._id);

    // Notificar a los administradores sobre la nueva solicitud
    try {
      notifyAdminsNewRequest(request);
    } catch (socketError) {
      console.error(
        "⚠️ Error al enviar notificación WebSocket:",
        socketError.message
      );
    }

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ Error al crear solicitud:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener todas las solicitudes
 */
export const getAllRequests = async (req, res) => {
  try {
    const { status, type, client } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (client) filter.client = client;

    const requests = await Request.findAll(filter);
    res.json(requests);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener una solicitud por ID
 */
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json(request);
  } catch (err) {
    console.error("❌ Error al obtener solicitud:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener solicitudes por cliente
 */
export const getRequestsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const requests = await Request.findByClient(clientId);
    res.json(requests);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener solicitudes por estado
 */
export const getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const requests = await Request.findByStatus(status);
    res.json(requests);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener solicitudes por tipo
 */
export const getRequestsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const requests = await Request.findByType(type);
    res.json(requests);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualizar una solicitud
 */
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Si se está asignando un processedBy, registrar la fecha de inicio
    if (updateData.processedBy && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    // Si se está completando, registrar la fecha de completado
    if (updateData.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const request = await Request.update(id, updateData);

    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Obtener el clientId (puede ser un objeto poblado o un ID)
    const clientId = request.client._id || request.client;

    // Notificar al cliente sobre la actualización
    try {
      notifyClientRequestUpdate(clientId.toString(), request);
    } catch (socketError) {
      console.error(
        "⚠️ Error al enviar notificación WebSocket:",
        socketError.message
      );
    }

    res.json(request);
  } catch (err) {
    console.error("❌ Error al actualizar solicitud:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Cambiar el estado de una solicitud
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, processedBy } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "El campo 'status' es requerido",
      });
    }

    const validStatuses = ["pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Obtener la solicitud actual antes de actualizar para saber el estado anterior
    const currentRequest = await Request.findById(id);
    if (!currentRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    const previousStatus = currentRequest.status;
    const request = await Request.updateStatus(id, status, processedBy);

    // Obtener el clientId (puede ser un objeto poblado o un ID)
    const clientId = request.client._id || request.client;

    // Notificar al cliente sobre el cambio de estado
    try {
      notifyRequestStatusChange(clientId.toString(), request, previousStatus);
    } catch (socketError) {
      console.error(
        "⚠️ Error al enviar notificación WebSocket:",
        socketError.message
      );
    }

    res.json(request);
  } catch (err) {
    console.error("❌ Error al actualizar estado de solicitud:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar una solicitud
 */
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.delete(id);

    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json({ message: "Solicitud eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar solicitud:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener solicitudes pendientes por cliente
 */
export const getPendingRequestsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const requests = await Request.findPendingByClient(clientId);
    res.json(requests);
  } catch (err) {
    console.error("❌ Error al obtener solicitudes pendientes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener estadísticas de solicitudes
 */
export const getRequestStats = async (req, res) => {
  try {
    const stats = await Request.getStats();
    res.json(stats);
  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
