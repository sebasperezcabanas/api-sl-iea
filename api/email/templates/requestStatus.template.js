export const requestStatusTemplate = (userName, requestId, newStatus) => {
  const html = `
    <h1>Actualización de Solicitud</h1>
    <p>Hola ${userName},</p>
    <p>Tu solicitud <strong>#${requestId}</strong> ha cambiado de estado a: <strong>${newStatus}</strong></p>
    <p>Puedes ver más detalles en tu panel de control.</p>
    <br>
    <p>Saludos,</p>
    <p>El equipo de SL IEA</p>
  `;

  const text = `
    Actualización de Solicitud
    
    Hola ${userName},
    
    Tu solicitud #${requestId} ha cambiado de estado a: ${newStatus}
    
    Puedes ver más detalles en tu panel de control.
    
    Saludos,
    El equipo de SL IEA
  `;

  return { html, text };
};
