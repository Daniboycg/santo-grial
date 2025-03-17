/**
 * Cliente de Resend para envío de emails
 * 
 * Este archivo configura un cliente singleton de Resend para
 * ser utilizado en toda la aplicación. Centraliza la configuración
 * y ofrece una instancia única para optimizar recursos.
 */

import { Resend } from 'resend';

// Verificación de la API key en entorno
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY no está definida en las variables de entorno.');
}

// Cliente singleton de Resend
export const resendClient = new Resend(process.env.RESEND_API_KEY);

// Configuración de remitentes permitidos
export const SENDERS = {
  DEFAULT: 'onboarding@resend.dev', // Cambiar por tu dominio verificado en producción
  NOTIFICATIONS: 'notifications@resend.dev', // Ejemplo para notificaciones
  SUPPORT: 'support@resend.dev', // Ejemplo para soporte
};

// Configuración por defecto para emails
export const DEFAULT_CONFIG = {
  from: SENDERS.DEFAULT,
}; 