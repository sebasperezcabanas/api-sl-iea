import RequestModel from "./request.model.js";

class Request {
  /**
   * Crear una nueva solicitud
   */
  static async create(requestData) {
    const request = new RequestModel(requestData);
    return await request.save();
  }

  /**
   * Obtener todas las solicitudes con filtros opcionales
   */
  static async findAll(filter = {}) {
    return await RequestModel.find(filter)
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email")
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener una solicitud por ID
   */
  static async findById(id) {
    return await RequestModel.findById(id)
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email");
  }

  /**
   * Obtener solicitudes por cliente
   */
  static async findByClient(clientId) {
    return await RequestModel.find({ client: clientId })
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email")
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener solicitudes por estado
   */
  static async findByStatus(status) {
    return await RequestModel.find({ status })
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email")
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener solicitudes por tipo
   */
  static async findByType(type) {
    return await RequestModel.find({ type })
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email")
      .sort({ createdAt: -1 });
  }

  /**
   * Actualizar una solicitud
   */
  static async update(id, updateData) {
    return await RequestModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email");
  }

  /**
   * Cambiar estado de una solicitud
   */
  static async updateStatus(
    id,
    status,
    processedBy = null,
    completedBy = null
  ) {
    const updateData = { status };

    // Si se asigna un admin y no se había asignado antes, registrar fecha de inicio
    if (processedBy) {
      const currentRequest = await RequestModel.findById(id);
      if (!currentRequest.processedBy) {
        updateData.startedAt = new Date();
      }
      updateData.processedBy = processedBy;
    }

    // Si se completa la solicitud, registrar fecha de completado y quién la completó
    if (status === "completed") {
      updateData.completedAt = new Date();
      if (completedBy) {
        updateData.completedBy = completedBy;
      }
    }

    return await RequestModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("client", "username email")
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .populate("processedBy", "username email")
      .populate("completedBy", "username email");
  }

  /**
   * Eliminar una solicitud
   */
  static async delete(id) {
    return await RequestModel.findByIdAndDelete(id);
  }

  /**
   * Obtener solicitudes pendientes por cliente
   */
  static async findPendingByClient(clientId) {
    return await RequestModel.find({
      client: clientId,
      status: { $in: ["pending", "in_progress"] },
    })
      .populate("antenna", "kitNumber name status")
      .populate("plan", "name dataAmount price")
      .populate("newPlan", "name dataAmount price")
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async getStats() {
    return await RequestModel.aggregate([
      {
        $group: {
          _id: { status: "$status", type: "$type" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.status": 1, "_id.type": 1 },
      },
    ]);
  }
}

export default Request;
