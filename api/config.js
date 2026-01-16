import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  DB_URI: process.env.DB_URI || "mongodb://localhost:27017/db-sl-iea",
  // Configuración de MailerSend
  MAILERSEND_API_KEY: process.env.MAILERSEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "info@domain.com",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "SL IEA",
  // URL del frontend para enlaces de reset password
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default config;
