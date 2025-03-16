'use client';

/**
 * Component for the chat window
 * Displays messages and handles user input
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Declaración de tipo para la extensión de la ventana global con mermaid
declare global {
  interface Window {
    mermaid?: any;
  }
}

// Tipos de mensajes
type MessageRole = 'user' | 'agent';

interface Message {
  role: MessageRole;
  content: string;
  id?: number;
}

interface ChatWindowProps {
  messages: Array<{ role: 'user' | 'agent', content: string }>;
  loading: boolean;
  onSendMessage: (message: string) => void;
  expanded: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export default function ChatWindow({ 
  messages, 
  loading, 
  onSendMessage,
  expanded,
  error,
  onClearError 
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false); // Default to false for static window
  const [unreadCount, setUnreadCount] = useState(0);
  // Estado para almacenar el código Mermaid por mensaje
  const [mermaidCodeMap, setMermaidCodeMap] = useState<Record<number, string>>({});
  // Estado para forzar la regeneración de un diagrama específico
  const [regenerateIndex, setRegenerateIndex] = useState<number | null>(null);
  
  // Detectar teclas para atajos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC para salir de vista completa
      if (e.key === 'Escape' && expanded) {
        // Aquí debería haber una función para colapsar la vista
        // Como no tenemos acceso directo, esto debería implementarse en el componente padre
        console.log('ESC pressed - Exit fullscreen');
      }
      
      // F para entrar en vista completa
      if (e.key === 'f' && !expanded) {
        // Aquí debería haber una función para expandir la vista
        console.log('F pressed - Enter fullscreen');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);
  
  // Improved auto-scroll logic - only when explicitly requested
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end'
      });
      
      // Reset unread count when manually scrolling down
      setUnreadCount(0);
    }
  };

  // Count unread messages instead of auto-scrolling
  useEffect(() => {
    // Don't count initial load or user messages
    if (messages.length > 0 && 
        messages[messages.length - 1].role === 'agent' && 
        chatContainerRef.current) {
      
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      // Si auto-scroll está desactivado
      if (!shouldAutoScroll) {
        // Si no está cerca del fondo, incrementar contador de no leídos
        if (!isNearBottom) {
          setUnreadCount(prev => prev + 1);
        }
      } 
      // Si auto-scroll está activado
      else {
        // Hacer scroll al fondo sin importar la posición
        scrollToBottom();
      }
    }
  }, [messages, shouldAutoScroll]);

  // Optional: scroll to bottom when loading state finishes - SOLO si auto-scroll está activado
  useEffect(() => {
    if (!loading && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [loading, shouldAutoScroll]);
  
  // Handle scroll events to determine position
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      // If user manually scrolls to bottom, reset unread count
      if (isNearBottom) {
        setUnreadCount(0);
      }
    }
  };

  // Auto-resize textarea when content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height based on content
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 42), 120); // Min 42px, max 120px
    textarea.style.height = `${newHeight}px`;
  }, [inputMessage]);

  // Update connection status based on error
  useEffect(() => {
    if (error) {
      setConnectionStatus('disconnected');
    } else {
      setConnectionStatus('connected');
    }
  }, [error]);

  /**
   * Extrae y almacena el código Mermaid de los mensajes
   */
  useEffect(() => {
    const newMermaidCodeMap: Record<number, string> = {};
    
    messages.forEach((message, index) => {
      if (message.role === 'agent' && message.content.includes('```mermaid')) {
        // Extraer el código Mermaid entre los delimitadores
        const mermaidMatch = message.content.match(/```mermaid\n([\s\S]*?)```/);
        if (mermaidMatch && mermaidMatch[1]) {
          newMermaidCodeMap[index] = mermaidMatch[1].trim();
        }
      }
    });
    
    setMermaidCodeMap(newMermaidCodeMap);
  }, [messages]);

  /**
   * Regenera un diagrama Mermaid específico
   */
  const regenerateDiagram = (index: number) => {
    // Resetear cualquier instancia previa de mermaid en el DOM
    if (typeof window !== 'undefined' && window.mermaid) {
      try {
        // Forzar regeneración marcando este índice
        setRegenerateIndex(index);
        
        // Programar un reset del regenerateIndex después de un momento
        setTimeout(() => {
          setRegenerateIndex(null);
        }, 500);
      } catch (error) {
        console.error('Error al regenerar el diagrama:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() && !loading) {
      // Clear any previous errors when sending a new message
      if (onClearError) {
        onClearError();
      }
      
      // Hacer scroll al fondo SOLO si auto-scroll está activado
      if (shouldAutoScroll) {
        scrollToBottom('auto');
      }
      
      onSendMessage(inputMessage);
      setInputMessage('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };
  
  // Handle Enter key for submit (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Toggle auto-scroll feature
  const toggleAutoScroll = () => {
    setShouldAutoScroll(prev => !prev);
    if (!shouldAutoScroll) {
      scrollToBottom();
    }
  };

  /**
   * Separa el contenido del código Mermaid para evitar renderizarlo con Markdown
   */
  const processMessageContent = (content: string, index: number) => {
    // Detectar si hay código Mermaid en el mensaje
    const hasMermaidCode = content.includes('```mermaid');
    
    // Si hay código Mermaid
    if (hasMermaidCode) {
      // Dividir el contenido en partes antes, durante y después del código Mermaid
      const parts = content.split(/```mermaid\n[\s\S]*?```/);
      const mermaidMatches = content.match(/```mermaid\n([\s\S]*?)```/g) || [];
      
      return (
        <div className="mermaid-container">
          {parts.map((part, partIndex) => {
            // Renderizar la parte de texto normal con Markdown
            const textPart = part && (
              <div key={`text-${partIndex}`} className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {part}
                </ReactMarkdown>
              </div>
            );
            
            // Renderizar el código Mermaid entre partes de texto
            const mermaidPart = mermaidMatches[partIndex] && (
              <div key={`mermaid-${partIndex}`} className="mermaid-diagram-wrapper relative mb-4 mt-2">
                <div className="bg-gray-800/80 rounded-lg p-4 overflow-x-auto relative">
                  {/* Título del diagrama con controles */}
                  <div className="flex justify-between items-center mb-2 text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                    <span>Diagrama</span>
                    <div className="flex gap-2 items-center">
                      {/* Botón para regenerar el diagrama */}
                      <button 
                        onClick={() => regenerateDiagram(index)}
                        className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition p-1 rounded hover:bg-gray-700"
                        title="Regenerar diagrama"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      
                      {/* Botón para copiar código Mermaid */}
                      <button 
                        onClick={() => {
                          if (mermaidCodeMap[index]) {
                            navigator.clipboard.writeText(mermaidCodeMap[index]);
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition p-1 rounded hover:bg-gray-700"
                        title="Copiar código del diagrama"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                      
                      {/* Controles para ampliar diagrama */}
                      <div className="flex items-center text-xs text-cyan-400 gap-1 ml-2 mr-2">
                        <span className="opacity-70">100%</span>
                      </div>
                      
                      {/* Botón para expandir/colapsar a pantalla completa */}
                      <button 
                        className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition p-1 rounded hover:bg-gray-700"
                        title="Pantalla completa (F) / Salir (ESC)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* El código Mermaid se renderiza aquí como texto */}
                  <pre className="text-sm text-gray-300 overflow-x-auto bg-black/20 p-2 rounded mermaid-code">
                    {mermaidMatches[partIndex]}
                  </pre>
                  
                  {/* Área para la previsualización del diagrama */}
                  <div 
                    className={`mt-3 p-3 bg-white/5 rounded-lg overflow-auto mermaid-preview ${regenerateIndex === index ? 'regenerating-diagram' : ''}`}
                  >
                    {/* Indicador de que se puede arrastrar */}
                    <div className="drag-indicator">
                      Arrastra para mover
                    </div>
                    
                    <div className="text-center text-xs text-gray-400 mb-2">
                      Diagrama generado a partir del código Mermaid
                    </div>
                    
                    {/* Aquí iría la previsualización generada por la biblioteca Mermaid */}
                    <div 
                      className="grid-pattern diagram-container"
                    >
                      <div className="mermaid text-center">{mermaidCodeMap[index]}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
            
            return (
              <React.Fragment key={`fragment-${partIndex}`}>
                {textPart}
                {mermaidPart}
              </React.Fragment>
            );
          })}
        </div>
      );
    }
    
    // Si no hay código Mermaid, renderizamos con Markdown normal
    return (
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden neon-border"
      animate={{
        width: expanded ? '100%' : '100%'
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Chat header with status indicator and controls */}
      <div className="py-3 px-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`rounded-full w-3 h-3 ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-500'} mr-2`}></div>
          <h2 className="text-lg font-medium text-white">Agente de n8n</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-scroll toggle */}
          <button
            onClick={toggleAutoScroll}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
              shouldAutoScroll 
                ? 'bg-purple-600/70 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            } transition-colors`}
            title={shouldAutoScroll ? "Desactivar desplazamiento automático" : "Activar desplazamiento automático"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 ${shouldAutoScroll ? 'text-white' : 'text-gray-400'}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Auto
          </button>
          
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`} 
            />
            <span className={`text-xs ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </span>
            {connectionStatus === 'disconnected' && (
              <button 
                onClick={onClearError}
                className="ml-2 text-xs text-purple-400 hover:text-purple-300 underline"
                title="Reintentar conexión"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed height chat container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 static-chat-container"
        style={{ 
          scrollbarWidth: 'thin',
          height: 'calc(100% - 120px)' // Fixed height for static behavior
        }}
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="text-purple-400 mb-2 text-2xl neon-text">✨ MultiAgent as a Service</div>
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
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'ml-auto neon-message-user max-w-[80%]'
                    : message.content.startsWith('⚠️')
                      ? 'mr-auto neon-message-error max-w-[90%]'
                      : 'mr-auto neon-message-agent max-w-[90%]'
                }`}
              >
                <div className="text-sm text-gray-300 mb-1">
                  {message.role === 'user' ? 'Tú' : 'Agente'}
                </div>
                <div className={`${message.role === 'agent' ? 'prose prose-invert' : 'whitespace-pre-wrap'}`}>
                  {message.role === 'agent' 
                    ? processMessageContent(message.content, index)
                    : message.content}
                </div>
              </motion.div>
            ))
          )}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="neon-message-agent p-3 rounded-lg max-w-[80%] mr-auto"
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
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      {/* Input form with expandable textarea - eliminado los controles de navegación */}
      <form onSubmit={handleSubmit} className="p-3 bg-gray-900 border-t border-gray-800">
        <div className="flex items-end">
          <div className="flex-1 rounded-l-lg bg-gray-800 focus-within:ring-2 focus-within:ring-purple-500 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-2 bg-transparent text-white focus:outline-none resize-none min-h-[42px] max-h-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 h-[42px] bg-purple-600 text-white rounded-r-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1 pl-2">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </div>
      </form>
    </motion.div>
  );
} 