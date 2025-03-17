'use client';

/**
 * Página de chat protegida
 * Requiere autenticación para acceder
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '@/hooks/useAgent';
import ChatWindow from '@/components/chat/ChatWindow';
import MermaidRenderer from '@/components/ui/MermaidRenderer';
import { useAuth, RedirectToSignIn } from '@clerk/nextjs';

// Interfaz para el usuario
interface User {
  id: number;
  email: string;
  name?: string;
  creditBalance: number;
  createdAt: string;
}

export default function ChatPage() {
  const { messages, mermaidCode, loading, error, sendMessage, hasMermaid, clearError } = useAgent();
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(true);
  
  // Verificación de autenticación con Clerk
  const { isLoaded, userId, sessionId } = useAuth();
  
  // Sincronizar usuario al cargar la página
  useEffect(() => {
    const syncUserWithDb = async () => {
      try {
        setSyncing(true);
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          console.error('Error al obtener datos del usuario:', await response.text());
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setSyncing(false);
      }
    };

    if (userId) {
      syncUserWithDb();
    }
  }, [userId]);

  // When mermaid code is detected, expand the view
  useEffect(() => {
    if (hasMermaid && !expanded) {
      setExpanded(true);
    }
  }, [hasMermaid, expanded]);

  // Toggle fullscreen mode for the diagram
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  // Si Clerk ya cargó pero no hay sesión, redireccionar a sign-in
  if (isLoaded && !userId) {
    return <RedirectToSignIn />;
  }
  
  // Si Clerk aún está cargando, mostrar un indicador de carga
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <main className="app-layout bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,40,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,40,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      {/* Background glow effects */}
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 filter blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-900/20 filter blur-[100px] opacity-50"></div>
      
      <div className={`app-container ${fullscreen ? 'p-0' : 'p-4 md:p-6'} relative z-10`}>
        {/* Header - hidden in fullscreen mode */}
        {!fullscreen && (
          <header className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent neon-text tracking-tight">
                MultiAgent as a Service Workflow Creator
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Generador de JSON para n8n
              </p>
            </div>
            {user && !syncing && (
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg">
                <span className="text-gray-300">Créditos:</span> 
                <span className="font-bold text-indigo-400">{user.creditBalance}</span>
              </div>
            )}
          </header>
        )}

        {/* Main content */}
        <div className="adaptive-panels flex-1 gap-4 min-h-0">
          {/* Chat Window - hidden in fullscreen mode */}
          {!fullscreen && (
            <AnimatePresence>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: expanded ? '60%' : '100%', 
                  opacity: 1,
                  flexGrow: expanded ? 0.6 : 1,
                  flexShrink: expanded ? 0 : 0,
                  flexBasis: expanded ? '60%' : '100%' 
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="min-h-0 h-full"
                style={{ minWidth: expanded ? '350px' : '100%' }}
              >
                <ChatWindow 
                  messages={messages}
                  loading={loading}
                  onSendMessage={sendMessage}
                  expanded={expanded}
                  error={error}
                  onClearError={clearError}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Mermaid Diagram Panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: fullscreen ? '100%' : '40%', 
                  opacity: 1,
                  flexGrow: fullscreen ? 1 : 0.4,
                  flexShrink: 0,
                  flexBasis: fullscreen ? '100%' : '40%'
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg ${fullscreen ? 'p-0' : 'p-4'} flex flex-col neon-border`}
                style={{ 
                  height: fullscreen ? '100vh' : 'auto',
                  margin: fullscreen ? 0 : undefined,
                  borderRadius: fullscreen ? 0 : undefined,
                  minWidth: fullscreen ? '100%' : '300px'
                }}
              >
                {/* Header is now inside MermaidRenderer component */}
                <div className="relative h-full">
                  {/* Close button absolute positioned in top corner */}
                  <button
                    onClick={() => {
                      if (fullscreen) {
                        setFullscreen(false);
                      } else {
                        setExpanded(false);
                      }
                    }}
                    className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white focus:outline-none rounded-full p-1 hover:bg-gray-800 bg-black/30 backdrop-blur-sm"
                    aria-label="Cerrar diagrama"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                  
                  {/* Diagram display - takes full height */}
                  <div className="h-full">
                    <MermaidRenderer 
                      code={mermaidCode || ''} 
                      onToggleFullscreen={toggleFullscreen}
                      isFullscreen={fullscreen}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - hidden in fullscreen mode */}
        {!fullscreen && (
          <footer className="mt-4 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MaaS WC. Todos los derechos reservados.</p>
          </footer>
        )}
      </div>
    </main>
  );
} 