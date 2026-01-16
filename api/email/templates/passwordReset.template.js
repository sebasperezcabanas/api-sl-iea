export const passwordResetTemplate = (userName, resetUrl) => {
  const html = `
    <h1>Restablecimiento de Contraseña</h1>
    <p>Hola ${userName},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña en SL IEA.</p>
    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Restablecer Contraseña</a></p>
    <p>O copia y pega este enlace en tu navegador:</p>
    <p>${resetUrl}</p>
    <br>
    <p><strong>⚠️ Este enlace expirará en 1 hora.</strong></p>
    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.</p>
    <br>
    <p>Saludos,</p>
    <p>El equipo de SL IEA</p>
  `;

  const text = `
    Restablecimiento de Contraseña
    
    Hola ${userName},
    
    Recibimos una solicitud para restablecer tu contraseña en SL IEA.
    
    Copia y pega el siguiente enlace en tu navegador para crear una nueva contraseña:
    ${resetUrl}
    
    ⚠️ Este enlace expirará en 1 hora.
    
    Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.
    
    Saludos,
    El equipo de SL IEA
  `;

  return { html, text };
};
