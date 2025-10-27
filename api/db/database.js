import mongoose from "mongoose";
import config from "../config.js";

const dbURI = config.DB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("✅ MongoDB conectado");

    // process.on("SIGINT", async () => {
    //   await mongoose.connection.close();
    //   console.log("🧹 MongoDB desconectado correctamente");
    //   process.exit(0);
    // });

    // process.on("SIGTERM", async () => {
    //   await mongoose.connection.close();
    //   console.log("🧹 MongoDB desconectado por SIGTERM");
    //   process.exit(0);
    // });
  } catch (err) {
    console.error("❌ Error al conectar MongoDB:", err.message);
    process.exit(1);
  }
};

export default connectDB;
