import UserModel from "./auth.model.js";

class UserDAO {
  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} userData - Datos del usuario (name, email, password)
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    try {
      const newUser = new UserModel(userData);
      const user = await newUser.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un usuario por criterios específicos
   * @param {Object} query - Objeto con los criterios de búsqueda
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findOne(query) {
    try {
      const user = await UserModel.findOne(query);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findAll() {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un usuario por ID
   * @param {String} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id) {
    try {
      const user = await UserModel.findById(id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un usuario por ID
   * @param {String} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async updateById(id, updateData) {
    try {
      const user = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un usuario por ID
   * @param {String} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario eliminado o null
   */
  async deleteById(id) {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Guarda el token de reset password (hasheado) para un usuario
   * @param {String} email - Email del usuario
   * @param {String} hashedToken - Token hasheado
   * @param {Date} expiresAt - Fecha de expiración
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async saveResetPasswordToken(email, hashedToken, expiresAt) {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiresAt,
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca usuarios con tokens de reset válidos (no expirados)
   * @returns {Promise<Array>} Lista de usuarios con tokens válidos
   */
  async findUsersWithValidResetTokens() {
    try {
      const users = await UserModel.find({
        resetPasswordToken: { $ne: null },
        resetPasswordExpires: { $gt: new Date() },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalida el token de reset password de un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async invalidateResetToken(userId) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   * @param {String} userId - ID del usuario
   * @param {String} hashedPassword - Contraseña hasheada
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async updatePassword(userId, hashedPassword) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Incrementa el contador de intentos de reset password
   * @param {String} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async incrementResetAttempts(email) {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        {
          $inc: { resetPasswordAttempts: 1 },
          resetPasswordLastAttempt: new Date(),
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resetea el contador de intentos de reset password
   * @param {String} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async resetAttempts(email) {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        {
          resetPasswordAttempts: 0,
          resetPasswordLastAttempt: null,
        },
        { new: true }
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar una instancia única de la clase (patrón Singleton)
const User = new UserDAO();
export default User;
