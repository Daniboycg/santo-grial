import { NextResponse } from 'next/server';
import { apiService } from '@/services/apiService';
import { prisma } from '@/lib/db';
import { sendGenerationCompleteEmail } from '@/services/emailService';

/**
 * Endpoint para recibir las respuestas del backend
 * Este endpoint es llamado por el backend cuando finaliza la generación de un JSON
 */
export async function POST(request: Request) {
  try {
    // Verificar el secreto del webhook para seguridad
    const webhookSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret !== process.env.BACKEND_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Secreto de webhook no válido' },
        { status: 401 }
      );
    }
    
    // Obtener los datos de la respuesta
    const data = await request.json();
    const { webhookCallId, jsonResult, status } = data;
    
    if (!webhookCallId) {
      return NextResponse.json(
        { error: 'Falta el ID de la llamada al webhook' },
        { status: 400 }
      );
    }
    
    // Actualizar la generación en la base de datos
    const updatedGeneration = await apiService.handleWebhookCallback(
      webhookCallId,
      jsonResult,
      status || 'completed'
    );
    
    // Si la generación se completó con éxito, enviar un email de notificación
    if (status === 'completed' || !status) {
      try {
        // Obtener datos del usuario para el email
        const generation = await prisma.generation.findUnique({
          where: { id: updatedGeneration.id },
          include: { user: true },
        });
        
        if (generation && generation.user) {
          const { user } = generation;
          
          // Enviar email de notificación
          await sendGenerationCompleteEmail(
            user.email,
            user.name || 'Usuario',
            generation.id.toString(),
            undefined
          );
          
          console.log(`Email de notificación enviado para la generación ${generation.id}`);
        }
      } catch (emailError) {
        // No bloqueamos el flujo si falla el envío de email
        console.error('Error al enviar email de notificación de generación:', emailError);
      }
    }
    
    return NextResponse.json({
      success: true,
      generationId: updatedGeneration.id,
    });
  } catch (error: any) {
    console.error('Error en el callback del webhook:', error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 