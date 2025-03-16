import { prisma } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type CookieOptions } from '@supabase/ssr';

// Función para obtener el cliente de Supabase en el servidor
export const getSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

// Función para obtener la sesión actual del usuario
export const getCurrentSession = async () => {
  const supabase = getSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error al obtener la sesión:', error);
    return null;
  }
  
  return session;
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const session = await getCurrentSession();
  
  if (!session) {
    return null;
  }
  
  return session.user;
};

// Función para obtener el usuario de Prisma asociado al usuario de Supabase
export const getPrismaUser = async () => {
  const supabaseUser = await getCurrentUser();
  
  if (!supabaseUser) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId: supabaseUser.id,
    },
  });
  
  return user;
};

// Función para redireccionar si el usuario no está autenticado
export const requireAuth = async (redirectUrl = '/login') => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(redirectUrl);
  }
  
  return user;
};

// Función para sincronizar un usuario de Supabase con nuestra base de datos Prisma
export const syncUser = async () => {
  const supabaseUser = await getCurrentUser();
  
  if (!supabaseUser) {
    return null;
  }
  
  // Verificamos si el usuario ya existe en nuestra base de datos
  const existingUser = await prisma.user.findUnique({
    where: {
      supabaseUserId: supabaseUser.id,
    },
  });
  
  // Si el usuario existe, lo actualizamos si es necesario
  if (existingUser) {
    if (existingUser.email !== supabaseUser.email) {
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: { email: supabaseUser.email || '' },
      });
    }
    return existingUser;
  }
  
  // Si el usuario no existe, lo creamos
  return await prisma.user.create({
    data: {
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || '',
    },
  });
}; 