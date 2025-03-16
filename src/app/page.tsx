'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

/**
 * Componente de Landing Page
 * Muestra información sobre la aplicación y permite iniciar sesión con Google
 */
export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  // Manejar inicio de sesión con Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
          MaaS WC: JSONs para n8n
        </h1>
        
        <p className="text-xl md:text-2xl text-center max-w-3xl mb-12 text-gray-200">
          Genera JSONs compatibles con n8n de forma rápida y sencilla mediante una conversación con IA
        </p>
        
        <div className="w-full max-w-3xl bg-black/50 p-2 rounded-lg border border-gray-700 shadow-2xl mb-12">
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded">
            <iframe 
              className="absolute top-0 left-0 w-full h-full" 
              width="560" 
              height="315" 
              src="https://www.youtube.com/embed/ui-15GsDLH0?start=94" 
              title="Tutorial de la aplicación" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-gray-800 font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:transform-none"
        >
          {loading ? (
            'Cargando...'
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>
      </section>

      {/* Características Section */}
      <section className="bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
            Características principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/30 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="text-indigo-400 text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Generación Instantánea</h3>
              <p className="text-gray-300">Crea JSONs para n8n en segundos a través de una conversación natural con IA.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="text-indigo-400 text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">Compatibilidad Total</h3>
              <p className="text-gray-300">Los JSONs generados son 100% compatibles con n8n, listos para usar inmediatamente.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="text-indigo-400 text-3xl mb-4">💾</div>
              <h3 className="text-xl font-bold mb-3">Historial de Generaciones</h3>
              <p className="text-gray-300">Accede a todas tus generaciones anteriores en cualquier momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-8">¿Listo para simplificar tus workflows?</h2>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="bg-indigo-600 text-white font-medium px-8 py-4 rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:transform-none"
        >
          {loading ? 'Cargando...' : 'Comenzar ahora - ¡Es gratis!'}
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2023 MaaS WC. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
