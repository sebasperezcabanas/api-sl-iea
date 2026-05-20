import mongoose from "mongoose";
import { CLIENT_TYPE, ROLE } from "./auth.constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    clientType: {
      type: String,
      enum: Object.values(CLIENT_TYPE),
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    resetPasswordLastAttempt: {
      type: Date,
      default: null,
    },
    signatureImageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Middleware para establecer clientType = IEA cuando role = admin
userSchema.pre("save", function (next) {
  if (this.role === ROLE.ADMIN && !this.clientType) {
    this.clientType = CLIENT_TYPE.IEA;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
