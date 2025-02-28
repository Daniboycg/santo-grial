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
  const { messages, mermaidCode, loading, sendMessage, hasMermaid } = useAgent();
  const [expanded, setExpanded] = useState(false);

  // When mermaid code is detected, expand the view
  useEffect(() => {
    if (hasMermaid && !expanded) {
      setExpanded(true);
    }
  }, [hasMermaid, expanded]);

  return (
    <main className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-4 md:p-8">
      <div className="container mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Santo Grial
          </h1>
          <p className="text-gray-400 mt-2">
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
          />

          {/* Mermaid Diagram Panel */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '40%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gray-900 rounded-lg shadow-lg p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-400">Diagrama</h2>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-gray-400 hover:text-white focus:outline-none"
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
