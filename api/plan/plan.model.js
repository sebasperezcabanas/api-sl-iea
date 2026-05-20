import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    dataAmount: {
      type: String,
      required: true,
      trim: true,
      // Ej: "50GB", "100GB", "Ilimitado"
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "ARS"],
      default: "USD",
    },
    active: {
      type: Boolean,
      default: true,
    },
    voucherIncludedInPlan: {
      type: Boolean,
      default: false,
      // Indica si el voucher está incluido en el precio del abono
    },
    voucherAmount: {
      type: Number,
      min: 0,
      default: 0,
      // Monto del voucher cuando no está incluido en el abono (voucherIncludedInPlan = false)
    },
  },
  {
    timestamps: true,
  },
);

// Índice compuesto único: un proveedor no puede tener dos planes con el mismo nombre y cantidad de datos
planSchema.index({ supplier: 1, name: 1, dataAmount: 1 }, { unique: true });

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
