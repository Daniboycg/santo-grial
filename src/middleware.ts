import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticación para Next.js
 * Protege las rutas que requieren autenticación
 * Sincroniza la sesión de Supabase
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crear cliente de Supabase para el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Obtener la sesión actual
  const { data: { session } } = await supabase.auth.getSession();

  // Lista de rutas protegidas que requieren autenticación
  const protectedRoutes = ['/chat', '/dashboard', '/profile', '/generate'];
  
  // Comprobar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Si la ruta está protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si es login y ya hay sesión, redirigir a la página principal
  if (request.nextUrl.pathname === '/login' && session) {
    const redirectUrl = new URL('/chat', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    // Rutas que requieren protección
    '/chat/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/generate/:path*',
    // Rutas de autenticación
    '/login',
  ],
}; 