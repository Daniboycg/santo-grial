import { NextResponse } from 'next/server';
import { syncUser, getCurrentUser } from '@/lib/supabase/auth';

/**
 * Endpoint para sincronizar un usuario de Supabase con nuestra base de datos Prisma
 * Se llama automáticamente después del login
 */
export async function GET() {
  try {
    // Verificar que hay un usuario autenticado
    const supabaseUser = await getCurrentUser();
    
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'No hay usuario autenticado' },
        { status: 401 }
      );
    }
    
    // Sincronizar el usuario
    const user = await syncUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Error al sincronizar el usuario' },
        { status: 500 }
      );
    }
    
    // Retornar el usuario sincronizado (sin datos sensibles)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      creditBalance: user.creditBalance,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Error en sincronización de usuario:', error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 