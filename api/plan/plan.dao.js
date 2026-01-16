import PlanModel from "./plan.model.js";

class PlanDAO {
  /**
   * Crea un nuevo plan
   */
  async create(planData) {
    try {
      const newPlan = new PlanModel(planData);
      const plan = await newPlan.save();
      return plan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un plan por criterios
   */
  async findOne(query) {
    try {
      const plan = await PlanModel.findOne(query).populate("supplier");
      return plan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca todos los planes con opción de filtrar por supplier
   */
  async findAll(filter = {}) {
    try {
      const plans = await PlanModel.find(filter)
        .populate("supplier")
        .sort({ name: 1 });
      return plans;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca planes por supplier
   */
  async findBySupplier(supplierId) {
    try {
      const plans = await PlanModel.find({ supplier: supplierId })
        .populate("supplier")
        .sort({ price: 1 });
      return plans;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca un plan por ID
   */
  async findById(id) {
    try {
      const plan = await PlanModel.findById(id).populate("supplier");
      return plan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un plan por ID
   */
  async updateById(id, updateData) {
    try {
      const plan = await PlanModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("supplier");
      return plan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un plan por ID
   */
  async deleteById(id) {
    try {
      const result = await PlanModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const Plan = new PlanDAO();
export default Plan;
