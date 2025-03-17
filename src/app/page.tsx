'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

/**
 * Componente de Landing Page
 * Muestra información sobre la aplicación y permite iniciar sesión
 */
export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = '/chat';
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-6">
          MaaS WC: JSONs para n8n
        </h1>
        
        <p className="text-xl md:text-2xl max-w-3xl mb-8">
          Genera JSONs compatibles con n8n de forma rápida y sencilla mediante una conversación con IA
        </p>
        
        <div className="w-full max-w-3xl mb-16">
          <iframe 
            className="w-full aspect-video rounded-lg shadow-2xl"
            src="https://www.youtube.com/embed/your-video-id"
            title="El Secreto de n8n: Multiagentes Que Crean Otros Agentes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        <div className="space-x-4">
          <Link
            href="/sign-in"
            className={`px-8 py-3 text-lg font-medium rounded-md bg-blue-600 hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onClick={() => setLoading(true)}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Link>
          
          <Link
            href="/sign-up"
            className="px-8 py-3 text-lg font-medium rounded-md border border-blue-600 text-blue-400 hover:border-blue-500 hover:text-blue-300 transition-colors"
          >
            Crear Cuenta
          </Link>
        </div>
        
        <p className="text-gray-400 mt-4 text-sm">
          ¡Obtén acceso instantáneo a una herramienta revolucionaria!
        </p>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} MaaS Workflow Creator</p>
      </footer>
    </div>
  );
}
