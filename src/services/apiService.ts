import { prisma } from '@/lib/db';

/**
 * Servicio para interactuar con el backend vía webhook
 * Maneja la creación y seguimiento de las generaciones de JSON
 */
export const apiService = {
  /**
   * Envía un prompt al backend para generar un JSON
   * @param userId - ID del usuario que hace la petición
   * @param prompt - Prompt descriptivo para generar el JSON
   * @returns Datos de la generación creada
   */
  async generateJson(userId: number, prompt: string) {
    try {
      // 1. Crear un registro de generación en Prisma
      const generation = await prisma.generation.create({
        data: {
          userId,
          prompt,
          status: 'pending',
        },
      });

      // 2. Preparar los datos para enviar al webhook
      const webhookData = {
        generationId: generation.id,
        prompt,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/generation-callback`,
      };

      // 3. Enviar los datos al webhook del backend
      const response = await fetch(process.env.BACKEND_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.BACKEND_WEBHOOK_SECRET!,
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`Error al contactar al backend: ${response.statusText}`);
      }

      // 4. Obtener el ID de la llamada al webhook
      const { webhookCallId } = await response.json();

      // 5. Actualizar el registro con el ID de la llamada
      await prisma.generation.update({
        where: { id: generation.id },
        data: { webhookCallId },
      });

      // 6. Reducir el saldo de créditos del usuario
      await prisma.user.update({
        where: { id: userId },
        data: {
          creditBalance: {
            decrement: 1,
          },
        },
      });

      // 7. Registrar la transacción
      await prisma.transaction.create({
        data: {
          userId,
          amount: -1,
          type: 'usage',
          status: 'completed',
          generationId: generation.id,
        },
      });

      return generation;
    } catch (error) {
      console.error('Error en generateJson:', error);
      throw error;
    }
  },

  /**
   * Obtener el estado de una generación
   * @param generationId - ID de la generación
   * @returns Datos de la generación
   */
  async getGenerationStatus(generationId: number) {
    try {
      return await prisma.generation.findUnique({
        where: { id: generationId },
      });
    } catch (error) {
      console.error('Error en getGenerationStatus:', error);
      throw error;
    }
  },

  /**
   * Manejar la respuesta del webhook del backend
   * @param webhookCallId - ID de la llamada al webhook
   * @param jsonResult - Resultado JSON generado
   * @param status - Estado de la generación ('completed' o 'failed')
   * @returns Generación actualizada
   */
  async handleWebhookCallback(
    webhookCallId: string,
    jsonResult?: string,
    status: 'completed' | 'failed' = 'completed'
  ) {
    try {
      // 1. Encontrar la generación por el webhookCallId
      const generation = await prisma.generation.findUnique({
        where: { webhookCallId },
      });

      if (!generation) {
        throw new Error(`Generación no encontrada para webhookCallId: ${webhookCallId}`);
      }

      // 2. Actualizar el estado y el resultado
      return await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status,
          jsonResult: jsonResult || null,
        },
      });
    } catch (error) {
      console.error('Error en handleWebhookCallback:', error);
      throw error;
    }
  },
}; 