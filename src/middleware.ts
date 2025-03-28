import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Middleware de autenticación para Next.js con Clerk
 * Protege las rutas que requieren autenticación
 */

// Este middleware usa Clerk para manejar la autenticación
export default clerkMiddleware();

// Configuración de rutas para el middleware
export const config = {
  matcher: [
    /*
     * Excluye archivos estáticos, archivos de API de Next.js (_next)
     * Excluye rutas de autenticación (sign-in, sign-up)
     * Excluye webhooks públicos de Clerk y API de webhooks
     */
    '/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up|api/webhooks).*)',
  ],
}; 