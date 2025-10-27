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
}

// Exportar una instancia única de la clase (patrón Singleton)
const User = new UserDAO();
export default User;
