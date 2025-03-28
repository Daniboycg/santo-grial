/**
 * API para sincronizar manualmente un usuario de Clerk con la base de datos Prisma
 * Se usa cuando el webhook de Clerk no ha creado al usuario correctamente
 */
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Obtener el usuario autenticado de Clerk
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener datos completos del usuario desde Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No se pudo obtener información del usuario de Clerk' },
        { status: 404 }
      );
    }
    
    // Comprobar si el usuario ya existe en Prisma
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });
    
    if (existingUser) {
      // El usuario ya existe, devolver los datos
      return NextResponse.json({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        creditBalance: existingUser.creditBalance,
        createdAt: existingUser.createdAt,
        message: 'Usuario ya existente'
      });
    }
    
    // Obtener email y nombre del usuario
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: 'Usuario sin email verificado' },
        { status: 400 }
      );
    }
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ');
    
    // Crear el usuario en Prisma
    const prismaUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email,
        name: name || '',
      },
    });
    
    // Obtener cliente de Supabase con privilegios de administrador
    const adminSupabase = getServiceSupabase();
    
    // Crear el usuario en Supabase
    await adminSupabase
      .from('users')
      .upsert({
        id: prismaUser.id,
        clerk_user_id: userId,
        email,
        name: name || '',
        credit_balance: prismaUser.creditBalance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    // Devolver los datos del usuario creado
    return NextResponse.json({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      creditBalance: prismaUser.creditBalance,
      createdAt: prismaUser.createdAt,
      message: 'Usuario creado correctamente'
    });
    
  } catch (error: any) {
    console.error('Error al sincronizar usuario:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 