import AntennaModel from "./antenna.model.js";
import { ANTENNA_STATUS } from "./antenna.constants.js";
import { PURCHASE_TYPE } from "./antenna.constants.js";

class AntennaDAO {
  /**
   * Crea una nueva antenna
   */
  async create(antennaData) {
    try {
      const newAntenna = new AntennaModel(antennaData);
      const antenna = await newAntenna.save();
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca una antenna por criterios
   */
  async findOne(query) {
    try {
      const antenna = await AntennaModel.findOne(query)
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca todas las antennas
   */
  async findAll(filter = {}) {
    try {
      const antennas = await AntennaModel.find(filter)
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan")
        .sort({ createdAt: -1 });
      return antennas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca antennas por cliente
   */
  async findByClient(clientId) {
    try {
      const antennas = await AntennaModel.find({ client: clientId })
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan")
        .sort({ createdAt: -1 });
      return antennas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca antennas por supplier
   */
  async findBySupplier(supplierId) {
    try {
      const antennas = await AntennaModel.find({ supplier: supplierId })
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan")
        .sort({ createdAt: -1 });
      return antennas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca una antenna por ID
   */
  async findById(id) {
    try {
      const antenna = await AntennaModel.findById(id)
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca una antenna por número de kit
   */
  async findByKitNumber(kitNumber) {
    try {
      const antenna = await AntennaModel.findOne({ kitNumber })
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una antenna por ID
   */
  async updateById(id, updateData) {
    try {
      const antenna = await AntennaModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activa una antenna con un plan
   */
  async activate(id, planId) {
    try {
      const antenna = await AntennaModel.findByIdAndUpdate(
        id,
        {
          status: ANTENNA_STATUS.ACTIVE,
          plan: planId,
          activationDate: new Date(),
          deactivationDate: null,
        },
        { new: true, runValidators: true }
      )
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Desactiva una antenna
   */
  async deactivate(id) {
    try {
      const antenna = await AntennaModel.findByIdAndUpdate(
        id,
        {
          status: ANTENNA_STATUS.INACTIVE,
          plan: null,
          deactivationDate: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate("client", "-password")
        .populate("supplier")
        .populate("plan");
      return antenna;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registra un pago de cuota
   */
  async registerInstallmentPayment(id) {
    try {
      const antenna = await AntennaModel.findById(id);
      if (!antenna) throw new Error("Antena no encontrada");

      if (antenna.purchaseType !== PURCHASE_TYPE.INSTALLMENTS) {
        throw new Error("Esta antena no fue adquirida en cuotas");
      }

      if (antenna.paidInstallments >= antenna.totalInstallments) {
        throw new Error("Todas las cuotas ya han sido pagadas");
      }

      antenna.paidInstallments += 1;
      await antenna.save();

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una antenna por ID
   */
  async deleteById(id) {
    try {
      const result = await AntennaModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const Antenna = new AntennaDAO();
export default Antenna;
