/**
 * Plantilla de email de bienvenida
 * 
 * Esta función genera el HTML para el email de bienvenida
 * que se envía a los usuarios cuando se registran.
 */

type WelcomeEmailProps = {
  userName: string;
  loginUrl: string;
};

/**
 * Genera el HTML para el email de bienvenida
 * 
 * @param params - Parámetros para personalizar el email
 * @returns HTML formateado del email
 */
export const welcomeEmailTemplate = ({ userName, loginUrl }: WelcomeEmailProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a MAaaSWC</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #6200ea;
          margin: 0 0 15px;
        }
        .button {
          display: inline-block;
          background-color: #6200ea;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.8em;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- <img src="[LOGO_URL]" alt="MAaaSWC Logo" class="logo"> -->
          <h1>¡Bienvenido a MAaaSWC!</h1>
        </div>
        
        <p>Hola ${userName},</p>
        
        <p>¡Gracias por registrarte en MultiAgent as a Service Workflow Creator! Estamos emocionados de tenerte a bordo.</p>
        
        <p>Con nuestra plataforma, podrás:</p>
        <ul>
          <li>Interactuar con nuestro avanzado agente de IA</li>
          <li>Generar flujos de trabajo JSON para n8n</li>
          <li>Visualizar tus flujos en diagramas interactivos</li>
        </ul>
        
        <p>Para comenzar a usar la plataforma, haz clic en el botón de abajo:</p>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="button">Comenzar ahora</a>
        </div>
        
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en responder a este email.</p>
        
        <p>¡Esperamos que disfrutes usando MAaaSWC!</p>
        
        <p>Saludos,<br>El equipo de MAaaSWC</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} MAaaSWC. Todos los derechos reservados.</p>
          <p>Este email fue enviado a ti porque te registraste en nuestra plataforma.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 