import User from "./auth.dao.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config.js";

const { JWT_SECRET } = config;

const generateToken = (userId, expiresIn = 24 * 60 * 60) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username: name });
    if (existingUsername) {
      return res
        .status(409)
        .json({ message: "Nombre de usuario ya registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear usuario usando el DAO
    const user = await User.create({
      username: name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      name: user.username,
      email: user.email,
      accessToken: token,
      expiresIn: 24 * 60 * 60,
    });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err.message);

    // Manejo específico de errores de MongoDB
    if (err.code === 11000) {
      // Error de duplicado - verificar qué campo está duplicado
      const field = Object.keys(err.keyPattern)[0];

      const messages = {
        email: "Email ya registrado",
        username: "Nombre de usuario ya registrado",
      };

      const message = messages[field] || "El registro ya existe";

      return res.status(409).json({ message });
    }

    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Datos de usuario inválidos", error: err.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar usuario usando el DAO
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña inválida" });
    }

    // Verificar contraseña
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña inválida" });
    }

    const token = generateToken(user._id);

    res.json({
      name: user.username,
      email: user.email,
      accessToken: token,
      expiresIn: 24 * 60 * 60,
    });
  } catch (err) {
    console.error("❌ Error en login:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
