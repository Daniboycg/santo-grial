import { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/auth';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Santo Grial',
  description: 'Inicia sesión o regístrate para comenzar a generar JSONs para n8n con IA',
};

/**
 * Página de login y registro
 * Si el usuario ya está autenticado, se redirige a la página principal
 */
export default async function LoginPage() {
  // Verificar si el usuario ya está autenticado
  const user = await getCurrentUser();
  
  // Si ya está autenticado, redirigir a la página principal
  if (user) {
    redirect('/');
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <AuthForm />
    </div>
  );
} 