/**
 * Service for communicating with the n8n agent via webhook
 * Handles sending messages and receiving responses
 */
import axios from 'axios';

// Webhook URL for the n8n agent
const WEBHOOK_URL = 'https://n8n.cognitiveds.ai/webhook-test/agent';

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
    const response = await axios.post(WEBHOOK_URL, { message });
    
    // Process the response to extract mermaid code if present
    const responseText = response.data.text || response.data.toString();
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    const matches = [...responseText.matchAll(mermaidRegex)];
    let processedText = responseText;
    let mermaidCode = undefined;
    
    if (matches.length > 0) {
      // Extract the mermaid code
      mermaidCode = matches[0][1];
      
      // Remove the mermaid code from the response text
      processedText = responseText.replace(mermaidRegex, '');
    }
    
    return {
      text: processedText.trim(),
      mermaidCode
    };
  } catch (error) {
    console.error('Error communicating with agent:', error);
    throw new Error('Failed to communicate with agent');
  }
} 