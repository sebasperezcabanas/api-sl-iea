import mongoose from "mongoose";
import { REQUEST_TYPES, REQUEST_STATUS } from "./request.constants.js";

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(REQUEST_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    // Cliente que realiza la solicitud
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Antena relacionada
    antenna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Antenna",
      default: null,
    },
    // Plan actual (opcional, para referencia)
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    // Nuevo plan a aplicar
    // - activate: plan a activar
    // - change_plan: nuevo plan
    // - deactivate: null (no aplica)
    newPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    // Usuario que procesó la solicitud
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Fecha de inicio de procesamiento
    startedAt: {
      type: Date,
      default: null,
    },
    // Fecha de completado
    completedAt: {
      type: Date,
      default: null,
    },
    // Comentarios o notas generales
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar búsquedas
requestSchema.index({ client: 1, status: 1 });
requestSchema.index({ status: 1, type: 1 });

const Request = mongoose.model("Request", requestSchema);

export default Request;
