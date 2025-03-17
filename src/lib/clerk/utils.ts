import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

/**
 * Obtiene el usuario actual de Clerk
 * @returns El usuario actual o null si no hay sesión
 */
export const getCurrentUser = async () => {
  return await currentUser();
};

/**
 * Obtiene el ID del usuario actual de Clerk
 * @returns El ID del usuario actual o null si no hay sesión
 */
export const getCurrentUserId = async () => {
  const session = await auth();
  return session.userId;
};

/**
 * Obtiene el usuario de Prisma asociado al usuario de Clerk actual
 * @returns El usuario de Prisma o null si no hay sesión
 */
export const getPrismaUser = async () => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  
  return user;
};

/**
 * Función para redireccionar si el usuario no está autenticado
 * @param redirectUrl URL a la que redireccionar si no hay sesión
 * @returns El ID del usuario si está autenticado
 */
export const requireAuth = async (redirectUrl = '/sign-in') => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    redirect(redirectUrl);
  }
  
  return userId;
}; 