export const passwordChangedTemplate = (userName) => {
  const html = `
    <h1>Contraseña Actualizada</h1>
    <p>Hola ${userName},</p>
    <p>Tu contraseña ha sido actualizada exitosamente.</p>
    <p><strong>⚠️ Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.</strong></p>
    <br>
    <p>Saludos,</p>
    <p>El equipo de SL IEA</p>
  `;

  const text = `
    Contraseña Actualizada
    
    Hola ${userName},
    
    Tu contraseña ha sido actualizada exitosamente.
    
    ⚠️ Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.
    
    Saludos,
    El equipo de SL IEA
  `;

  return { html, text };
};
