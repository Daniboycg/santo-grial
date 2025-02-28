'use client';

/**
 * Component for the chat window
 * Displays messages and handles user input
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  messages: Array<{ role: 'user' | 'agent', content: string }>;
  loading: boolean;
  onSendMessage: (message: string) => void;
  expanded: boolean;
}

export default function ChatWindow({ 
  messages, 
  loading, 
  onSendMessage,
  expanded 
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() && !loading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden"
      animate={{
        width: expanded ? '60%' : '100%'
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="text-purple-400 mb-2 text-2xl">✨ Santo Grial</div>
              <p className="text-gray-400">
                Haz una pregunta para comenzar a hablar con el agente.
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-purple-700 ml-auto'
                    : 'bg-gray-800 mr-auto'
                }`}
              >
                <div className="text-sm text-gray-300 mb-1">
                  {message.role === 'user' ? 'Tú' : 'Agente'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </motion.div>
            ))
          )}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-3 rounded-lg max-w-[80%] mr-auto"
            >
              <div className="text-sm text-gray-300 mb-1">Agente</div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-r-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </motion.div>
  );
} 