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
}

export function useAgent(): UseAgentReturn {
  // State for messages, mermaid code, loading status and errors
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent', content: string }>>([]);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sends a message to the agent and handles the response
   */
  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to the list
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      // Send message to agent and get response
      const response = await sendMessageToAgent(message);
      
      // Add agent response to the list
      setMessages(prev => [...prev, { role: 'agent', content: response.text }]);
      
      // If mermaid code is present in the response, update the state
      if (response.mermaidCode) {
        setMermaidCode(response.mermaidCode);
      }
    } catch (err) {
      setError('Failed to communicate with the agent. Please try again.');
      console.error(err);
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
    hasMermaid: mermaidCode !== null
  };
} 