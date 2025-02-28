'use client';

/**
 * Simple page to test the webhook directly
 * Helps diagnose issues with the webhook
 */
import { useState } from 'react';
import axios from 'axios';

export default function WebhookTest() {
  const [testMessage, setTestMessage] = useState('Hola, este es un mensaje de prueba');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test the connection to the webhook with a GET request
  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/test-webhook');
      setResult(response.data);
      
      if (response.data.status === 'error') {
        setError('Error conectando con el webhook. Ver detalles en los resultados.');
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setError('Error en la prueba de conexión: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setResult(err);
    } finally {
      setLoading(false);
    }
  };

  // Test sending a message to the webhook
  const sendTestMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/test-webhook', { message: testMessage });
      setResult(response.data);
      
      if (response.data.status === 'error') {
        setError('Error enviando mensaje al webhook. Ver detalles en los resultados.');
      }
    } catch (err) {
      console.error('Error sending test message:', err);
      setError('Error enviando mensaje: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setResult(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent neon-text">
            Diagnóstico de Webhook
          </h1>
          <p className="text-gray-400">
            Herramienta para probar la conexión con el webhook de n8n
          </p>
        </header>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Probar Conexión</h2>
          <p className="text-gray-300 mb-4">
            Realiza una solicitud GET para verificar que el webhook responde correctamente.
          </p>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg 
                     hover:bg-cyan-700 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Probando...' : 'Probar Conexión'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Enviar Mensaje de Prueba</h2>
          <p className="text-gray-300 mb-4">
            Envía un mensaje al webhook para verificar que responde correctamente.
          </p>
          
          <div className="mb-4">
            <label htmlFor="testMessage" className="block text-gray-300 mb-2">
              Mensaje de prueba:
            </label>
            <textarea
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>
          
          <button
            onClick={sendTestMessage}
            disabled={loading || !testMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8 text-red-300">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Resultados</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 