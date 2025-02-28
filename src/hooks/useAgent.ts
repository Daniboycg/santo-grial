/**
 * Custom hook for interacting with the agent
 * Manages state and communication with the agent service
 */
import { useState } from 'react';
import { sendMessageToAgent } from '../services/agentService';

interface UseAgentReturn {
  messages: Array<{ role: 'user' | 'agent', content: string }>;
  mermaidCode: string | null;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  hasMermaid: boolean;
  clearError: () => void;
}

export function useAgent(): UseAgentReturn {
  // State for messages, mermaid code, loading status and errors
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent', content: string }>>([]);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error message
  const clearError = () => setError(null);

  /**
   * Sends a message to the agent and handles the response
   */
  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to the list
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      console.log('Enviando mensaje al agente:', message);
      
      // Send message to agent and get response
      const response = await sendMessageToAgent(message);
      
      console.log('Respuesta del agente recibida:', response);
      
      // Add agent response to the list
      setMessages(prev => [...prev, { role: 'agent', content: response.text }]);
      
      // If mermaid code is present in the response, update the state
      if (response.mermaidCode) {
        setMermaidCode(response.mermaidCode);
      }
    } catch (err) {
      // Extract the error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al comunicarse con el agente';
      
      console.error('Error al comunicarse con el agente:', err);
      
      // Set a user-friendly error message and add it to the messages
      setError(errorMessage);
      
      // Add error message to chat as a system message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'agent', 
          content: `⚠️ ${errorMessage}\n\nSugerencias:\n- Verifica que el servidor n8n esté ejecutándose\n- Revisa tu conexión a internet\n- Intenta nuevamente en unos momentos` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    mermaidCode,
    loading,
    error,
    sendMessage,
    hasMermaid: mermaidCode !== null,
    clearError
  };
} 