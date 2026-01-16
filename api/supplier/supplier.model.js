import mongoose from "mongoose";
import { ANTENNA_TYPE } from "../antenna/antenna.constants.js";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    antennaTypes: {
      type: [String],
      enum: Object.values(ANTENNA_TYPE),
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message:
          "El proveedor debe tener al menos un tipo de antena disponible",
      },
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

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
