'use client';

/**
 * Component for the chat window
 * Displays messages and handles user input
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Improved auto-scroll logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end'
      });
    }
  };

  // Auto-scroll on messages change if we're near the bottom
  useEffect(() => {
    // Check if we need to scroll to bottom when messages update
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      // Only auto-scroll if already near the bottom, or if it's a new message from the user
      if (isNearBottom || (messages.length > 0 && messages[messages.length - 1].role === 'user')) {
        scrollToBottom(messages.length > 0 && messages[messages.length - 1].role === 'user' ? 'auto' : 'smooth');
      }
    } else {
      scrollToBottom();
    }
  }, [messages]);

  // Also scroll when loading state changes (becomes true or false)
  useEffect(() => {
    scrollToBottom();
  }, [loading]);
  
  // Auto-scroll when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (shouldAutoScroll) {
        scrollToBottom('auto');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldAutoScroll]);

  // Handle scroll events to determine if auto-scroll should be enabled
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      setShouldAutoScroll(isNearBottom);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() && !loading) {
      // Clear any previous errors when sending a new message
      if (onClearError) {
        onClearError();
      }
      
      // Enable auto-scroll when user sends a message
      setShouldAutoScroll(true);
      
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

  /**
   * Separa el contenido del código Mermaid para evitar renderizarlo con Markdown
   */
  const processMessageContent = (content: string) => {
    // Detectar si hay código Mermaid en el mensaje (ya debería estar eliminado por el agentService)
    const hasMermaidCode = content.includes('```mermaid');
    
    // Si hay código Mermaid, no usamos Markdown para evitar conflictos
    if (hasMermaidCode) {
      return <pre>{content}</pre>;
    }
    
    // Renderizamos con Markdown
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
      {/* Chat header with status indicator */}
      <div className="p-3 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`rounded-full w-3 h-3 ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-500'} mr-2`}></div>
          <h2 className="text-lg font-medium text-white">Agente de n8n</h2>
        </div>
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
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50"
        style={{ scrollbarWidth: 'thin' }}
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
                    ? processMessageContent(message.content)
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
      
      {/* "Scroll to bottom" button appears when user scrolls up */}
      {!shouldAutoScroll && messages.length > 3 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            scrollToBottom();
          }}
          className="absolute bottom-[70px] right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg z-10 flex items-center gap-1.5 animate-fadeIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          <span className="text-xs pr-1">Nuevos mensajes</span>
        </button>
      )}
      
      {/* Input form with expandable textarea */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
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
              rows={1}
              style={{ overflow: inputMessage.length > 100 ? 'auto' : 'hidden' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 h-[42px] bg-purple-600 text-white rounded-r-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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