import { NextResponse } from 'next/server';
import { getCurrentUser, getPrismaUser } from '@/lib/supabase/auth';

/**
 * Endpoint para verificar el estado de autenticación y sincronización del usuario
 * Devuelve información sobre el usuario de Supabase y Prisma
 */
export async function GET() {
  try {
    // Verificar que hay un usuario autenticado en Supabase
    const supabaseUser = await getCurrentUser();
    
    if (!supabaseUser) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No hay usuario autenticado',
          supabaseUser: null,
          prismaUser: null
        },
        { status: 200 }
      );
    }
    
    // Obtener el usuario de Prisma
    const prismaUser = await getPrismaUser();
    
    // Devolver el estado completo
    return NextResponse.json({
      authenticated: true,
      synced: !!prismaUser,
      message: prismaUser 
        ? 'Usuario autenticado y sincronizado correctamente' 
        : 'Usuario autenticado pero no sincronizado con la base de datos',
      supabaseUser: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        metadata: supabaseUser.user_metadata,
      },
      prismaUser: prismaUser 
        ? {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            creditBalance: prismaUser.creditBalance,
            createdAt: prismaUser.createdAt,
          } 
        : null,
    });
  } catch (error: any) {
    console.error('Error al verificar estado de usuario:', error);
    
    return NextResponse.json(
      { 
        authenticated: false,
        synced: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
} 