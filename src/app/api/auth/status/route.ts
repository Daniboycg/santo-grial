import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Endpoint para verificar el estado de autenticación
 * Esta ruta proporciona una forma de verificar si el usuario está autenticado
 * sin depender de cookies en el lado del cliente
 */
export async function GET() {
  try {
    const authState = await auth();
    
    if (!authState.userId) {
      return NextResponse.json(
        { authenticated: false, message: 'No autenticado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      userId: authState.userId
    });
  } catch (error) {
    console.error('Error al verificar estado de autenticación:', error);
    
    return NextResponse.json(
      { error: 'Error interno al verificar autenticación' },
      { status: 500 }
    );
  }
} 