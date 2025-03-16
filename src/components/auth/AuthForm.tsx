'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Tipos de autenticación
type AuthType = 'login' | 'register';

/**
 * Componente que muestra un formulario de login o registro
 * Utiliza Supabase Auth para gestionar la autenticación
 */
export default function AuthForm() {
  // Estado para controlar si estamos en login o registro
  const [authType, setAuthType] = useState<AuthType>('login');
  
  // Estado para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Estado para mensajes de error o éxito
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para sincronizar el usuario con nuestra base de datos
  const syncUserWithDatabase = async () => {
    try {
      const response = await fetch('/api/auth/sync');
      if (!response.ok) {
        console.error('Error al sincronizar usuario:', await response.text());
      }
    } catch (error) {
      console.error('Error al llamar a la API de sincronización:', error);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (authType === 'login') {
        // Iniciar sesión con Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Sincronizar el usuario con nuestra base de datos
        await syncUserWithDatabase();
        
        setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
        
        // Redirigir al usuario (el servidor manejará la redirección)
        window.location.href = '/';
      } else {
        // Registrar usuario con Supabase
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) throw error;
        setMessage('¡Registro exitoso! Verifica tu correo electrónico para confirmar tu cuenta.');
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar entre login y registro
  const toggleAuthType = () => {
    setAuthType(authType === 'login' ? 'register' : 'login');
    setMessage('');
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {authType === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {authType === 'login'
            ? 'Ingresa a tu cuenta para continuar'
            : 'Regístrate para comenzar a usar la aplicación'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Campo de nombre (solo para registro) */}
        {authType === 'register' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* Campo de email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Campo de contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Mensaje de error o éxito */}
        {message && (
          <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Botón de envío */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : authType === 'login'
              ? 'Iniciar Sesión'
              : 'Registrarse'}
          </button>
        </div>

        {/* Enlace para cambiar entre login y registro */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleAuthType}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {authType === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </form>
    </div>
  );
} 