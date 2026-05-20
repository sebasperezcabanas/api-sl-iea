/**
 * Servicio para obtener cotizaciones de dólar
 */

/**
 * Obtiene la cotización del dólar contado con liquidación
 * @returns {Promise<Object>} Datos de la cotización
 */
export const getDolarCCL = async () => {
  try {
    const response = await fetch(
      "https://dolarapi.com/v1/dolares/contadoconliqui",
    );

    if (!response.ok) {
      throw new Error(`Error al obtener cotización: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error al consultar la API de dólar: ${error.message}`);
  }
};
