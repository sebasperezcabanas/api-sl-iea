import Plan from "./plan.dao.js";
import Supplier from "../supplier/supplier.dao.js";

/**
 * Crear un nuevo plan
 */
export const createPlan = async (req, res) => {
  try {
    const { name, supplier, dataAmount, price, currency } = req.body;

    // Validar campos requeridos
    if (!name || !supplier || !dataAmount || price === undefined || !currency) {
      return res.status(400).json({
        message:
          "Nombre, proveedor, cantidad de datos, precio y moneda son requeridos",
      });
    }

    // Verificar que el supplier existe
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        message: "El proveedor especificado no existe",
      });
    }

    // Validar que currency sea USD o ARS
    if (!["USD", "ARS"].includes(currency)) {
      return res.status(400).json({
        message: "La moneda debe ser USD o ARS",
      });
    }

    // Crear plan
    const plan = await Plan.create({
      name,
      supplier,
      dataAmount,
      price,
      currency,
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error("❌ Error al crear plan:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message:
          "Ya existe un plan con ese nombre y cantidad de datos para este proveedor",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener todos los planes
 */
export const getAllPlans = async (req, res) => {
  try {
    const { supplier, active } = req.query;
    let filter = {};

    if (supplier) filter.supplier = supplier;
    if (active !== undefined) filter.active = active === "true";

    const plans = await Plan.findAll(filter);
    res.json(plans);
  } catch (err) {
    console.error("❌ Error al obtener planes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener planes por supplier
 */
export const getPlansBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const plans = await Plan.findBySupplier(supplierId);
    res.json(plans);
  } catch (err) {
    console.error("❌ Error al obtener planes:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener un plan por ID
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }

    res.json(plan);
  } catch (err) {
    console.error("❌ Error al obtener plan:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualizar un plan
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si se está cambiando el supplier, verificar que existe
    if (updateData.supplier) {
      const supplierExists = await Supplier.findById(updateData.supplier);
      if (!supplierExists) {
        return res.status(404).json({
          message: "El proveedor especificado no existe",
        });
      }
    }

    // Si se está cambiando la moneda, validar que sea USD o ARS
    if (updateData.currency && !["USD", "ARS"].includes(updateData.currency)) {
      return res.status(400).json({
        message: "La moneda debe ser USD o ARS",
      });
    }

    const plan = await Plan.updateById(id, updateData);

    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }

    res.json(plan);
  } catch (err) {
    console.error("❌ Error al actualizar plan:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message:
          "Ya existe un plan con ese nombre y cantidad de datos para este proveedor",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar un plan
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.deleteById(id);

    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }

    res.json({ message: "Plan eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar plan:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
