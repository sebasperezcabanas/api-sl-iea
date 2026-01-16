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
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto único: un proveedor no puede tener dos planes con el mismo nombre y cantidad de datos
planSchema.index({ supplier: 1, name: 1, dataAmount: 1 }, { unique: true });

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
