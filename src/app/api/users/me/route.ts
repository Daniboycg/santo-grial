import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * API endpoint para obtener los datos del usuario actual
 * Requiere autenticación
 * @returns Datos del usuario actual
 */
export async function GET(req: NextRequest) {
  // Obtener la autenticación del usuario
  const { userId } = await getAuth(req);
  
  // Si no hay usuario autenticado, devolver un error 401
  if (!userId) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }
  
  try {
    // Obtener el usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    
    // Si no se encuentra el usuario, devolver un error 404
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Devolver los datos del usuario (sin información sensible)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      creditBalance: user.creditBalance,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Error al obtener datos del usuario:', error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 