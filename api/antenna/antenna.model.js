import mongoose from "mongoose";
import {
  ANTENNA_STATUS,
  ANTENNA_TYPE,
  PURCHASE_TYPE,
} from "./antenna.constants.js";

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
    type: {
      type: String,
      enum: Object.values(ANTENNA_TYPE),
      required: true,
    },
    purchaseType: {
      type: String,
      enum: Object.values(PURCHASE_TYPE),
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
      enum: Object.values(ANTENNA_STATUS),
      default: ANTENNA_STATUS.INACTIVE,
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

// Validación: tipo de antena debe estar disponible para el proveedor
antennaSchema.pre("save", async function (next) {
  // Populate supplier para obtener los tipos disponibles
  await this.populate("supplier");

  const availableTypes = this.supplier?.antennaTypes || [];
  const antennaType = this.type;

  // Validar que el tipo de antena esté en la lista del proveedor
  if (!availableTypes.includes(antennaType)) {
    return next(
      new Error(
        `El tipo de antena '${antennaType}' no está disponible para el proveedor '${
          this.supplier?.name
        }'. Tipos disponibles: ${availableTypes.join(", ")}`
      )
    );
  }

  next();
});

// Validación personalizada: si está activada, debe tener un plan
antennaSchema.pre("save", function (next) {
  if (this.status === ANTENNA_STATUS.ACTIVE && !this.plan) {
    next(new Error("Una antena activada debe tener un plan asignado"));
  } else if (this.status === ANTENNA_STATUS.INACTIVE) {
    this.plan = null;
  }
  next();
});

// Validación: si es en cuotas, debe tener totalInstallments > 0
antennaSchema.pre("save", function (next) {
  if (
    this.purchaseType === PURCHASE_TYPE.INSTALLMENTS &&
    this.totalInstallments <= 0
  ) {
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
