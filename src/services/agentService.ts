/**
 * Service for communicating with the n8n agent via webhook
 * Handles sending messages and receiving responses
 */
import axios from 'axios';

// Webhook URL for the n8n agent - asegúrate que esta URL es correcta
const WEBHOOK_URL = 'https://danielcarreon.app.n8n.cloud/webhook-test/agent';

// Interface for the agent response
interface AgentResponse {
  text: string;
  mermaidCode?: string;
}

/**
 * Sends a message to the n8n agent and processes the response
 * Extracts mermaid code if present in the response
 */
export async function sendMessageToAgent(message: string): Promise<AgentResponse> {
  try {
    console.log('Sending message to webhook:', message);
    console.log('Webhook URL:', WEBHOOK_URL);
    
    // Usando GET en lugar de POST ya que el webhook está configurado para GET
    const response = await axios.get(WEBHOOK_URL, {
      // Enviando el mensaje como parámetro de consulta
      params: { message },
      headers: {
        'Accept': 'application/json'
      },
      // Mantener el timeout para evitar esperas infinitas
      timeout: 30000
    });
    
    console.log('Response received:', response.status, response.statusText);
    console.log('Response data:', response.data);
    
    // Process the response to extract mermaid code if present
    // The actual response format may differ - adjust based on what n8n actually returns
    const responseText = typeof response.data === 'string' 
      ? response.data 
      : response.data.text || response.data.message || response.data.toString();
    
    console.log('Processed response text:', responseText);
    
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    const matches = [...responseText.matchAll(mermaidRegex)];
    let processedText = responseText;
    let mermaidCode = undefined;
    
    if (matches.length > 0) {
      // Extract the mermaid code
      mermaidCode = matches[0][1];
      console.log('Mermaid code found:', mermaidCode);
      
      // Remove the mermaid code from the response text
      processedText = responseText.replace(mermaidRegex, '');
    }
    
    return {
      text: processedText.trim(),
      mermaidCode
    };
  } catch (error) {
    // Enhanced error handling with detailed information
    if (axios.isAxiosError(error)) {
      console.error('Axios error communicating with agent:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Provide more specific error messages based on the error
      if (error.code === 'ECONNABORTED') {
        throw new Error('La conexión con el agente ha excedido el tiempo de espera. Por favor, intenta nuevamente.');
      }
      
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        throw new Error(`Error del servidor: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No se recibió respuesta del servidor. Verifica tu conexión a internet.');
      }
    }
    
    console.error('Error comunicándose con el agente:', error);
    throw new Error('No se pudo comunicar con el agente. Por favor, intenta nuevamente.');
  }
} 