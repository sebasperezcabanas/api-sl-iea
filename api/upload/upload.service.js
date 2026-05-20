import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import config from "../config.js";

// Configurar Cloudinary con las credenciales del entorno
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Multer con almacenamiento en memoria: el buffer se envía directo a Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB máximo
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen"));
    }
    cb(null, true);
  },
});

/**
 * Sube un buffer de imagen a Cloudinary y devuelve la URL pública segura.
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} folder - Carpeta destino en Cloudinary
 * @param {string} publicId - ID público del recurso (sobreescribe si ya existe)
 * @returns {Promise<string>} URL segura (https) del recurso subido
 */
export const uploadImageToCloudinary = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};

/**
 * Elimina un recurso de Cloudinary a partir de su URL pública.
 * Usado cuando el usuario reemplaza su firma por una nueva.
 * @param {string} imageUrl - URL pública de Cloudinary
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extraer el public_id de la URL (segmento entre /upload/v.../  y la extensión)
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (matches) {
      await cloudinary.uploader.destroy(matches[1]);
    }
  } catch (err) {
    console.error("❌ Error al eliminar imagen de Cloudinary:", err.message);
  }
};
