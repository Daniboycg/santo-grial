/**
 * API Route for testing the webhook directly
 * This helps diagnose issues with the webhook without going through the UI
 */
import { NextResponse } from 'next/server';
import axios from 'axios';

// Webhook URL to test
const WEBHOOK_URL = 'https://danielcarreon.app.n8n.cloud/webhook-test/agent';

// Definición de tipo para detalles de error
interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  statusText?: string;
  data?: any;
  isNetworkError?: boolean;
}

export async function GET(request: Request) {
  try {
    // Log that we're testing the webhook
    console.log('Testing webhook connectivity to:', WEBHOOK_URL);
    
    // Make a simple GET request to test if the webhook is reachable
    const pingResponse = await axios.get(WEBHOOK_URL, {
      timeout: 5000
    });
    
    return NextResponse.json({
      status: 'success',
      statusCode: pingResponse.status,
      message: 'Webhook is reachable',
      response: pingResponse.data
    });
  } catch (error) {
    // Log detailed error info
    console.error('Error testing webhook:', error);
    
    let errorDetails: ErrorDetails = {
      message: 'Unknown error'
    };
    
    if (axios.isAxiosError(error)) {
      errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: error.request && !error.response
      };
    }
    
    return NextResponse.json({
      status: 'error',
      error: errorDetails
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get the test message from the request
    const { message = 'Test message from Santo Grial' } = await request.json();
    
    console.log('Testing webhook with message:', message);
    
    // Make a POST request to the webhook with the test message
    const response = await axios.post(WEBHOOK_URL, 
      { message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );
    
    return NextResponse.json({
      status: 'success',
      statusCode: response.status,
      message: 'Webhook responded successfully',
      response: response.data
    });
  } catch (error) {
    // Log detailed error info
    console.error('Error testing webhook:', error);
    
    let errorDetails: ErrorDetails = {
      message: 'Unknown error'
    };
    
    if (axios.isAxiosError(error)) {
      errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: error.request && !error.response
      };
    }
    
    return NextResponse.json({
      status: 'error',
      error: errorDetails
    }, { status: 500 });
  }
} 