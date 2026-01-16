import Antenna from "./antenna.dao.js";
import User from "../auth/auth.dao.js";
import Supplier from "../supplier/supplier.dao.js";
import Plan from "../plan/plan.dao.js";
import { PURCHASE_TYPE, ANTENNA_STATUS } from "./antenna.constants.js";

/**
 * Crear una nueva antenna
 */
export const createAntenna = async (req, res) => {
  try {
    const {
      name,
      kitNumber,
      client,
      supplier,
      type,
      purchaseType,
      totalInstallments,
      installmentAmount,
      plan,
      status,
      activationDate,
      deactivationDate,
      notes,
    } = req.body;

    // Validar campos requeridos
    if (!kitNumber || !client || !supplier || !type || !purchaseType) {
      return res.status(400).json({
        message:
          "Número de kit, cliente, proveedor, tipo de antena y tipo de compra son requeridos",
      });
    }

    // Verificar que el número de kit no existe
    const existingAntenna = await Antenna.findByKitNumber(kitNumber);
    if (existingAntenna) {
      return res.status(409).json({
        message: "Ya existe una antena con ese número de kit",
      });
    }

    // Verificar que el cliente existe
    const clientExists = await User.findById(client);
    if (!clientExists) {
      return res.status(404).json({
        message: "El cliente especificado no existe",
      });
    }

    // Verificar que el supplier existe
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        message: "El proveedor especificado no existe",
      });
    }

    // Verificar que el plan existe si se especifica
    if (plan) {
      const planExists = await Plan.findById(plan);
      if (!planExists) {
        return res.status(404).json({
          message: "El plan especificado no existe",
        });
      }
    }

    // Validar datos de cuotas
    if (
      purchaseType === PURCHASE_TYPE.INSTALLMENTS &&
      (!totalInstallments || totalInstallments <= 0)
    ) {
      return res.status(400).json({
        message:
          "Para tipo de compra en cuotas, debe especificar la cantidad de cuotas totales",
      });
    }

    // Crear antenna
    const antennaData = {
      name: name || "",
      kitNumber,
      client,
      supplier,
      type,
      purchaseType,
      notes,
    };

    // Agregar campos opcionales si están presentes
    if (plan) antennaData.plan = plan;
    if (status) antennaData.status = status;
    if (activationDate) antennaData.activationDate = activationDate;
    if (deactivationDate) antennaData.deactivationDate = deactivationDate;

    if (purchaseType === PURCHASE_TYPE.INSTALLMENTS) {
      antennaData.totalInstallments = totalInstallments;
      antennaData.installmentAmount = installmentAmount || 0;
      antennaData.paidInstallments = 0;
    }

    const antenna = await Antenna.create(antennaData);

    res.status(201).json(antenna);
  } catch (err) {
    console.error("❌ Error al crear antena:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una antena con ese número de kit",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener todas las antennas
 */
export const getAllAntennas = async (req, res) => {
  try {
    const { client, supplier, status } = req.query;
    let filter = {};

    if (client) filter.client = client;
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;

    const antennas = await Antenna.findAll(filter);
    res.json(antennas);
  } catch (err) {
    console.error("❌ Error al obtener antenas:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener antennas por cliente
 */
export const getAntennasByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const antennas = await Antenna.findByClient(clientId);
    res.json(antennas);
  } catch (err) {
    console.error("❌ Error al obtener antenas:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener una antenna por ID // ESTO ES NECESARIO SI LAS PIDO POR KIT NUMBER ?
 */
export const getAntennaById = async (req, res) => {
  try {
    const { id } = req.params;
    const antenna = await Antenna.findById(id);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json(antenna);
  } catch (err) {
    console.error("❌ Error al obtener antena:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener una antenna por número de kit
 */
export const getAntennaByKitNumber = async (req, res) => {
  try {
    const { kitNumber } = req.params;
    const antenna = await Antenna.findByKitNumber(kitNumber);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json(antenna);
  } catch (err) {
    console.error("❌ Error al obtener antena:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualizar una antenna
 */
export const updateAntenna = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar referencias si se están actualizando
    if (updateData.client) {
      const clientExists = await User.findById(updateData.client);
      if (!clientExists) {
        return res.status(404).json({
          message: "El cliente especificado no existe",
        });
      }
    }

    if (updateData.supplier) {
      const supplierExists = await Supplier.findById(updateData.supplier);
      if (!supplierExists) {
        return res.status(404).json({
          message: "El proveedor especificado no existe",
        });
      }
    }

    const antenna = await Antenna.updateById(id, updateData);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json(antenna);
  } catch (err) {
    console.error("❌ Error al actualizar antena:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una antena con ese número de kit",
      });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Activar una antenna con un plan
 */
export const activateAntenna = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        message: "El plan es requerido para activar la antena",
      });
    }

    // Verificar que el plan existe
    const planExists = await Plan.findById(planId);
    if (!planExists) {
      return res.status(404).json({
        message: "El plan especificado no existe",
      });
    }

    const antenna = await Antenna.activate(id, planId);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json(antenna);
  } catch (err) {
    console.error("❌ Error al activar antena:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Desactivar una antenna
 */
export const deactivateAntenna = async (req, res) => {
  try {
    const { id } = req.params;
    const antenna = await Antenna.deactivate(id);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json(antenna);
  } catch (err) {
    console.error("❌ Error al desactivar antena:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Registrar pago de cuota
 */
export const registerInstallmentPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const antenna = await Antenna.registerInstallmentPayment(id);

    res.json({
      message: "Pago de cuota registrado correctamente",
      antenna,
      remainingInstallments:
        antenna.totalInstallments - antenna.paidInstallments,
    });
  } catch (err) {
    console.error("❌ Error al registrar pago:", err.message);

    if (err.message.includes("no encontrada")) {
      return res.status(404).json({ message: err.message });
    }

    if (
      err.message.includes("no fue adquirida en cuotas") ||
      err.message.includes("ya han sido pagadas")
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar una antenna
 */
export const deleteAntenna = async (req, res) => {
  try {
    const { id } = req.params;
    const antenna = await Antenna.deleteById(id);

    if (!antenna) {
      return res.status(404).json({ message: "Antena no encontrada" });
    }

    res.json({ message: "Antena eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar antena:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
