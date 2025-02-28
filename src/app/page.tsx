'use client';

/**
 * Main page component
 * Integrates all components and manages state
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../hooks/useAgent';
import ChatWindow from '../components/chat/ChatWindow';
import MermaidRenderer from '../components/ui/MermaidRenderer';

export default function Home() {
  const { messages, mermaidCode, loading, error, sendMessage, hasMermaid, clearError } = useAgent();
  const [expanded, setExpanded] = useState(false);

  // When mermaid code is detected, expand the view
  useEffect(() => {
    if (hasMermaid && !expanded) {
      setExpanded(true);
    }
  }, [hasMermaid, expanded]);

  return (
    <main className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,40,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,40,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      {/* Background glow effects */}
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 filter blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-900/20 filter blur-[100px] opacity-50"></div>
      
      <div className="container mx-auto h-full flex flex-col relative z-10">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent neon-text tracking-tight">
            Santo Grial
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Tu asistente personal potenciado por IA
          </p>
        </header>

        {/* Main content */}
        <div className="flex-1 flex gap-6 relative overflow-hidden">
          {/* Chat Window */}
          <ChatWindow 
            messages={messages}
            loading={loading}
            onSendMessage={sendMessage}
            expanded={expanded}
            error={error}
            onClearError={clearError}
          />

          {/* Mermaid Diagram Panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '40%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col neon-border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Diagrama</h2>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-gray-400 hover:text-white focus:outline-none rounded-full p-1 hover:bg-gray-800"
                    aria-label="Cerrar diagrama"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
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
                </div>
                {/* Diagram display */}
                <div className="flex-1">
                  <MermaidRenderer code={mermaidCode || ''} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Santo Grial. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
