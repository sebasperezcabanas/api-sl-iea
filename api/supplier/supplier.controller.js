import Supplier from "./supplier.dao.js";

/**
 * Crear un nuevo supplier
 */
export const createSupplier = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validar campos requeridos
    if (!name || !email) {
      return res.status(400).json({
        message: "Nombre y email son requeridos",
      });
    }

    // Verificar si ya existe
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese email",
      });
    }

    // Crear supplier
    const supplier = await Supplier.create({
      name,
      email,
    });

    res.status(201).json(supplier);
  } catch (err) {
    console.error("❌ Error al crear proveedor:", err.message);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        message: `Ya existe un proveedor con ese ${field}`,
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener todos los suppliers
 */
export const getAllSuppliers = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active !== undefined ? { active: active === "true" } : {};

    const suppliers = await Supplier.findAll(filter);
    res.json(suppliers);
  } catch (err) {
    console.error("❌ Error al obtener proveedores:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener un supplier por ID
 */
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(supplier);
  } catch (err) {
    console.error("❌ Error al obtener proveedor:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualizar un supplier
 */
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.updateById(id, updateData);

    if (!supplier) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(supplier);
  } catch (err) {
    console.error("❌ Error al actualizar proveedor:", err.message);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        message: `Ya existe un proveedor con ese ${field}`,
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar un supplier
 */
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.deleteById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar proveedor:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
