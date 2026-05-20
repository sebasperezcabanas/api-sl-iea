import { getDolarCCL } from "./exchange.service.js";

/**
 * Controlador para obtener el valor de venta del dólar CCL
 */
export const getDolarCCLVenta = async (req, res) => {
  try {
    const data = await getDolarCCL();

    res.json({
      venta: data.venta,
      fechaActualizacion: data.fechaActualizacion,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la cotización del dólar",
      details: error.message,
    });
  }
};

/**
 * Controlador para obtener toda la información del dólar CCL
 */
export const getDolarCCLCompleto = async (req, res) => {
  try {
    const data = await getDolarCCL();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la cotización del dólar",
      details: error.message,
    });
  }
};
