import SupplierModel from "./supplier.model.js";

class SupplierDAO {
  /**
   * Crea un nuevo supplier
   */
  async create(supplierData) {
    try {
      const newSupplier = new SupplierModel(supplierData);
      const supplier = await newSupplier.save();
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un supplier por criterios
   */
  async findOne(query) {
    try {
      const supplier = await SupplierModel.findOne(query);
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca todos los suppliers
   */
  async findAll(filter = {}) {
    try {
      const suppliers = await SupplierModel.find(filter).sort({ name: 1 });
      return suppliers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un supplier por ID
   */
  async findById(id) {
    try {
      const supplier = await SupplierModel.findById(id);
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un supplier por ID
   */
  async updateById(id, updateData) {
    try {
      const supplier = await SupplierModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un supplier por ID
   */
  async deleteById(id) {
    try {
      const result = await SupplierModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const Supplier = new SupplierDAO();
export default Supplier;
