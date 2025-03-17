/**
 * Servicio para el envío de emails usando Resend
 * 
 * Este servicio provee funciones para enviar distintos tipos de emails
 * transaccionales a través de la API de Resend. Utiliza plantillas HTML
 * predefinidas y maneja errores de envío.
 * 
 * @module emailService
 */

import { resendClient, DEFAULT_CONFIG, SENDERS } from '@/lib/resend';
import { welcomeEmailTemplate, generationCompleteTemplate } from '@/lib/resend/templates';
import { ErrorResponse } from 'resend/build/error';

/**
 * Logger centralizado para el servicio de email
 * @param message - Mensaje a loguear
 * @param data - Datos adicionales opcionales
 */
const logger = (message: string, data?: any) => {
  // En producción, aquí podrías conectar con un servicio de logging
  console.log(`[EmailService] ${message}`, data || '');
};

/**
 * Envía un email de bienvenida al usuario registrado
 * 
 * @param email - Email del destinatario
 * @param name - Nombre del usuario
 * @returns Promise con el resultado del envío
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const { data, error } = await resendClient.emails.send({
      ...DEFAULT_CONFIG,
      to: email,
      subject: '¡Bienvenido a MAaaSWC!',
      html: welcomeEmailTemplate({
        userName: name,
        loginUrl: `${appUrl}/chat`,
      }),
    });
    
    if (error) {
      logger('Error al enviar email de bienvenida', error);
      return false;
    }
    
    logger('Email de bienvenida enviado con éxito', { id: data?.id, email });
    return true;
  } catch (error) {
    logger('Excepción al enviar email de bienvenida', error);
    return false;
  }
};

/**
 * Envía una notificación de generación completada
 * 
 * @param email - Email del destinatario
 * @param name - Nombre del usuario
 * @param generationId - ID de la generación completada
 * @param generationName - Nombre opcional de la generación
 * @returns Promise con el resultado del envío
 */
export const sendGenerationCompleteEmail = async (
  email: string,
  name: string,
  generationId: string,
  generationName?: string
): Promise<boolean> => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const { data, error } = await resendClient.emails.send({
      ...DEFAULT_CONFIG,
      from: SENDERS.NOTIFICATIONS,
      to: email,
      subject: 'Tu generación de JSON está lista',
      html: generationCompleteTemplate({
        userName: name,
        generationId,
        generationName,
        dashboardUrl: `${appUrl}/generations/${generationId}`,
      }),
    });
    
    if (error) {
      logger('Error al enviar notificación de generación', error);
      return false;
    }
    
    logger('Notificación de generación enviada con éxito', { id: data?.id, email, generationId });
    return true;
  } catch (error) {
    logger('Excepción al enviar notificación de generación', error);
    return false;
  }
};

/**
 * Envía un email genérico con contenido HTML personalizado
 * 
 * @param to - Email del destinatario
 * @param subject - Asunto del email
 * @param html - Contenido HTML
 * @param options - Opciones adicionales para el envío
 * @returns Promise con el resultado del envío
 */
export const sendCustomEmail = async (
  to: string,
  subject: string,
  html: string,
  options?: {
    from?: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
  }
): Promise<{ success: boolean; id?: string; error?: ErrorResponse }> => {
  try {
    const { data, error } = await resendClient.emails.send({
      ...DEFAULT_CONFIG,
      ...options,
      to,
      subject,
      html,
    });
    
    if (error) {
      logger('Error al enviar email personalizado', error);
      return { success: false, error };
    }
    
    logger('Email personalizado enviado con éxito', { id: data?.id, to });
    return { success: true, id: data?.id };
  } catch (error) {
    logger('Excepción al enviar email personalizado', error);
    return { success: false, error: error as ErrorResponse };
  }
}; 