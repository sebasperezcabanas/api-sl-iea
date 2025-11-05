import mongoose from "mongoose";

const antennaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    kitNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ["comodato", "one_payment", "installments"],
      required: true,
    },
    // Campos para el control de cuotas
    paidInstallments: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalInstallments: {
      type: Number,
      default: 0,
      min: 0,
    },
    installmentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Estado de la antena
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Plan asociado (solo si está activada)
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    // Fecha de activación
    activationDate: {
      type: Date,
      default: null,
    },
    // Fecha de desactivación
    deactivationDate: {
      type: Date,
      default: null,
    },
    // Notas adicionales
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validación personalizada: si está activada, debe tener un plan
antennaSchema.pre("save", function (next) {
  if (this.status === "active" && !this.plan) {
    next(new Error("Una antena activada debe tener un plan asignado"));
  } else if (this.status === "inactive") {
    this.plan = null;
  }
  next();
});

// Validación: si es en cuotas, debe tener totalInstallments > 0
antennaSchema.pre("save", function (next) {
  if (this.purchaseType === "installments" && this.totalInstallments <= 0) {
    next(
      new Error(
        "Si la forma de compra es en cuotas, debe especificar la cantidad de cuotas totales"
      )
    );
  }
  next();
});

const Antenna = mongoose.model("Antenna", antennaSchema);

export default Antenna;
