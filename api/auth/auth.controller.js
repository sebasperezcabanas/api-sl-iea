import User from "./auth.dao.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import config from "../config.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../email/email.service.js";

const { JWT_SECRET } = config;

const generateToken = (userId, expiresIn = 24 * 60 * 60) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, clientType } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Validar que clientType esté presente si no es admin
    if (role !== "admin" && !clientType) {
      return res
        .status(400)
        .json({ message: "El tipo de cliente es requerido" });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res
        .status(409)
        .json({ message: "Nombre de usuario ya registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear usuario usando el DAO
    const userData = {
      username: username,
      email,
      password: hashedPassword,
      role: role || "user",
      clientType: role === "admin" ? "IEA" : clientType,
    };

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      username: user.username,
      email: user.email,
      role: user.role,
      clientType: user.clientType,
      createdAt: user.createdAt,
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

    // 🔍 LOG TEMPORAL: Datos recibidos
    console.log("=== LOGIN ATTEMPT ===");
    console.log("📧 Email recibido:", email);
    console.log("🔑 Password recibido:", password);
    console.log("📝 Tipo de email:", typeof email);
    console.log("📝 Tipo de password:", typeof password);

    // Validar datos requeridos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar usuario usando el DAO
    const user = await User.findOne({ email });

    // 🔍 LOG TEMPORAL: Usuario encontrado
    console.log("👤 Usuario encontrado:", user ? "SÍ" : "NO");
    if (user) {
      console.log("📧 Email en DB:", user.email);
      console.log("🔐 Hash en DB:", user.password);
      console.log("👤 Username:", user.username);
      console.log("🎭 Role:", user.role);
    }

    if (!user) {
      console.log("❌ Usuario NO encontrado con email:", email);
      return res.status(401).json({ message: "Usuario o contraseña inválida" });
    }

    // Verificar contraseña
    const isMatch = bcrypt.compareSync(password, user.password);

    // 🔍 LOG TEMPORAL: Comparación de contraseñas
    console.log("🔐 Password match:", isMatch);
    console.log("🔑 Password enviado:", password);
    console.log("🔐 Hash almacenado:", user.password);

    if (!isMatch) {
      console.log("❌ Contraseña NO coincide");
      return res.status(401).json({ message: "Usuario o contraseña inválida" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      clientType: user.clientType,
      accessToken: token,
      expiresIn: 24 * 60 * 60,
    });

    console.log("✅ Usuario logueado:", user.email);
  } catch (err) {
    console.error("❌ Error en login:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // Excluir contraseñas de la respuesta
    const usersWithoutPassword = users.map((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });

    res.json({
      success: true,
      count: usersWithoutPassword.length,
      data: usersWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Excluir contraseña de la respuesta
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      data: userObj,
    });
  } catch (err) {
    console.error("❌ Error al obtener usuario:", err.message);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

// Actualizar un usuario por ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, clientType, active } = req.body;

    // Verificar que el usuario existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar que no se intente cambiar la contraseña por esta vía
    if (req.body.password) {
      return res.status(400).json({
        message:
          "No se puede cambiar la contraseña por esta vía. Usa reset-password",
      });
    }

    // Si se cambia el email, verificar que no esté en uso
    if (email && email !== existingUser.email) {
      const emailInUse = await User.findOne({ email });
      if (emailInUse) {
        return res.status(409).json({ message: "Email ya registrado" });
      }
    }

    // Si se cambia el username, verificar que no esté en uso
    if (username && username !== existingUser.username) {
      const usernameInUse = await User.findOne({ username });
      if (usernameInUse) {
        return res
          .status(409)
          .json({ message: "Nombre de usuario ya registrado" });
      }
    }

    // Preparar datos a actualizar
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    // Si se cambia a admin, forzar clientType a IEA
    if (role === "admin") {
      updateData.clientType = "IEA";
    } else if (clientType) {
      updateData.clientType = clientType;
    }

    // Actualizar usuario
    const updatedUser = await User.updateById(id, updateData);

    // Excluir contraseña de la respuesta
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      clientType: updatedUser.clientType,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err.message);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos de usuario inválidos",
        error: err.message,
      });
    }

    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar usuario
    await User.deleteById(id);

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err.message);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// Validar complejidad de contraseña
const validatePassword = (password) => {
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una mayúscula";
  }
  if (!/[a-z]/.test(password)) {
    return "La contraseña debe contener al menos una minúscula";
  }
  if (!/[0-9]/.test(password)) {
    return "La contraseña debe contener al menos un número";
  }
  return null;
};

// Endpoint para solicitar restablecimiento de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que el email esté presente
    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });

    // IMPORTANTE: Siempre devolver el mismo mensaje (seguridad)
    const genericMessage =
      "Si el email existe, recibirás un enlace para restablecer tu contraseña";

    // Si el usuario no existe, devolver mensaje genérico sin revelar info
    if (!user) {
      console.log(`⚠️ Intento de reset para email no registrado: ${email}`);
      return res.status(200).json({ message: genericMessage });
    }

    // Rate limiting: Verificar intentos de reset
    const ONE_HOUR = 60 * 60 * 1000;
    const now = new Date();

    if (user.resetPasswordLastAttempt) {
      const timeSinceLastAttempt = now - user.resetPasswordLastAttempt;

      // Si han pasado más de 1 hora, resetear contador
      if (timeSinceLastAttempt > ONE_HOUR) {
        await User.resetAttempts(email);
      } else if (user.resetPasswordAttempts >= 3) {
        // Máximo 3 intentos por hora
        console.log(`⚠️ Rate limit excedido para email: ${email}`);
        return res.status(429).json({
          message: "Demasiados intentos. Intenta nuevamente en una hora.",
        });
      }
    }

    // Incrementar contador de intentos
    await User.incrementResetAttempts(email);

    // Generar token aleatorio seguro (32 bytes = 64 caracteres hex)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hashear el token antes de guardarlo en la BD
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Establecer expiración (1 hora)
    const expiresAt = new Date(now.getTime() + ONE_HOUR);

    // Guardar token hasheado en la base de datos
    await User.saveResetPasswordToken(email, hashedToken, expiresAt);

    // Construir URL de reset (token plano, solo se envía por email)
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar email con el token
    try {
      await sendPasswordResetEmail(user.email, user.username, resetUrl);
      console.log(`✅ Email de reset enviado a: ${user.email}`);
    } catch (emailError) {
      console.error("❌ Error al enviar email:", emailError.message);
      // Continuar y devolver mensaje genérico (no revelar el error)
    }

    // Devolver mensaje genérico (seguridad)
    res.status(200).json({ message: genericMessage });
  } catch (err) {
    console.error("❌ Error en forgotPassword:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Endpoint para restablecer la contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validar campos requeridos
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token y nueva contraseña son requeridos",
      });
    }

    // Validar complejidad de la nueva contraseña
    // const passwordError = validatePassword(newPassword);
    // if (passwordError) {
    // return res.status(400).json({ message: passwordError });
    // }

    // Buscar usuarios con tokens válidos (no expirados)
    const users = await User.findUsersWithValidResetTokens();

    if (!users || users.length === 0) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    // Buscar el usuario cuyo token hasheado coincida con el token proporcionado
    let matchedUser = null;
    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    // Si no se encontró ningún usuario con el token
    if (!matchedUser) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await User.updatePassword(matchedUser._id, hashedPassword);

    // Invalidar el token usado
    await User.invalidateResetToken(matchedUser._id);

    // Resetear contador de intentos
    await User.resetAttempts(matchedUser.email);

    // Enviar email de confirmación de cambio de contraseña
    try {
      await sendPasswordChangedEmail(matchedUser.email, matchedUser.username);
      console.log(`✅ Email de confirmación enviado a: ${matchedUser.email}`);
    } catch (emailError) {
      console.error(
        "❌ Error al enviar email de confirmación:",
        emailError.message
      );
      // Continuar aunque falle el email
    }

    console.log(`✅ Contraseña restablecida para: ${matchedUser.email}`);

    res.status(200).json({
      message: "Contraseña restablecida exitosamente",
    });
  } catch (err) {
    console.error("❌ Error en resetPassword:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
