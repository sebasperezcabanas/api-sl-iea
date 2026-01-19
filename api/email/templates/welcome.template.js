export const welcomeTemplate = (userName) => {
  const html = `
    <h1>¡Bienvenido a SL IEA!</h1>
    <p>Hola ${userName},</p>
    <p>Gracias por registrarte en nuestro sistema de gestión de antenas satelitales.</p>
    <p>Estamos encantados de tenerte con nosotros.</p>
    <br>
    <p>Saludos,</p>
    <p>El equipo de IEA S.R.L</p>
  `;

  const text = `
    ¡Bienvenido a SL IEA!
    
    Hola ${userName},
    
    Gracias por registrarte en nuestro sistema de gestión de antenas satelitales.
    Estamos encantados de tenerte con nosotros.
    
    Saludos,
    El equipo de IEA S.R.L
  `;

  return { html, text };
};
