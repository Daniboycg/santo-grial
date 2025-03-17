/**
 * Plantilla de email de generación completada
 * 
 * Esta función genera el HTML para el email que notifica
 * a los usuarios cuando su generación JSON ha sido completada.
 */

type GenerationCompleteProps = {
  userName: string;
  generationId: string;
  generationName?: string;
  dashboardUrl: string;
};

/**
 * Genera el HTML para el email de generación completada
 * 
 * @param params - Parámetros para personalizar el email
 * @returns HTML formateado del email
 */
export const generationCompleteTemplate = ({ 
  userName, 
  generationId, 
  generationName, 
  dashboardUrl 
}: GenerationCompleteProps): string => {
  const displayName = generationName || `Generación #${generationId}`;
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu generación está lista</title>
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
          color: #00c853;
          margin: 0 0 15px;
        }
        .generation-info {
          background-color: #f2f8ff;
          border-left: 4px solid #00c853;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .button {
          display: inline-block;
          background-color: #00c853;
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
          <h1>¡Tu generación está lista!</h1>
        </div>
        
        <p>Hola ${userName},</p>
        
        <p>Buenas noticias! Tu generación JSON para n8n ha sido completada con éxito.</p>
        
        <div class="generation-info">
          <p><strong>Nombre:</strong> ${displayName}</p>
          <p><strong>ID:</strong> ${generationId}</p>
          <p><strong>Estado:</strong> Completado</p>
        </div>
        
        <p>Puedes acceder a tu generación haciendo clic en el botón de abajo:</p>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">Ver mi generación</a>
        </div>
        
        <p>Recuerda que puedes importar este archivo JSON directamente en n8n para crear tu flujo de trabajo.</p>
        
        <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
        
        <p>Saludos,<br>El equipo de MAaaSWC</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} MAaaSWC. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 