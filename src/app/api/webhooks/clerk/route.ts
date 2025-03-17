import { prisma } from '@/lib/db';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// TODO: Implementar servicio de emails
// import { sendWelcomeEmail } from '@/services/emailService';

/**
 * Handler para los webhooks de Clerk
 * Sincroniza usuarios entre Clerk, Prisma y Supabase
 */
export async function POST(req: Request) {
  // Verificación y validación del webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Falta CLERK_WEBHOOK_SECRET');
    return new NextResponse('Configuración del webhook incorrecta', { status: 500 });
  }

  // Obtener los encabezados de la solicitud
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // Si falta algún encabezado, rechazar la solicitud
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Faltan encabezados de webhook de Clerk', { status: 400 });
  }

  // Obtener el cuerpo de la solicitud
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Validar la firma del webhook
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error al verificar el webhook:', err);
    return new NextResponse('Error al verificar el webhook', { status: 400 });
  }

  // Manejar diferentes tipos de eventos
  const eventType = evt.type;
  
  // Obtener cliente de Supabase con privilegios de administrador
  const adminSupabase = getServiceSupabase();
  
  try {
    if (eventType === 'user.created') {
      // Extraer datos del usuario
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Obtener el email principal
      const emailObject = email_addresses && email_addresses[0];
      const email = emailObject ? emailObject.email_address : '';
      const name = [first_name, last_name].filter(Boolean).join(' ');
      
      // 1. Crear el usuario en Prisma
      const prismaUser = await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email,
          name: name || '',
        },
      });
      
      // 2. Crear o actualizar el usuario en Supabase
      // Nota: Esto no crea una autenticación en Supabase, solo un registro en la tabla users
      const { data: supabaseUser, error: supabaseError } = await adminSupabase
        .from('users')
        .upsert({
          id: prismaUser.id, // Usar el mismo ID que en Prisma
          clerk_user_id: id,
          email: email,
          name: name || '',
          credit_balance: prismaUser.creditBalance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (supabaseError) {
        console.error('Error al crear usuario en Supabase:', supabaseError);
      }
      
      console.log(`Usuario creado: ${id}, ${email}`);

      // 3. Enviar email de bienvenida (comentado hasta implementar servicio de email)
      /*
      try {
        if (email) {
          const emailSent = await sendWelcomeEmail(email, name || 'Usuario');
          console.log(`Email de bienvenida para ${email}: ${emailSent ? 'Enviado' : 'Falló'}`);
        }
      } catch (emailError) {
        // No bloqueamos el flujo si falla el envío de email
        console.error('Error al enviar email de bienvenida:', emailError);
      }
      */
    } 
    else if (eventType === 'user.updated') {
      // Actualizar el usuario
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Obtener el email principal actualizado
      const emailObject = email_addresses && email_addresses[0];
      const email = emailObject ? emailObject.email_address : '';
      const name = [first_name, last_name].filter(Boolean).join(' ');
      
      // 1. Actualizar el usuario en Prisma
      const prismaUser = await prisma.user.update({
        where: { clerkUserId: id },
        data: {
          email: email,
          name: name || '',
        },
      });
      
      // 2. Actualizar el usuario en Supabase
      const { error: supabaseError } = await adminSupabase
        .from('users')
        .update({
          email: email,
          name: name || '',
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', id);
      
      if (supabaseError) {
        console.error('Error al actualizar usuario en Supabase:', supabaseError);
      }
      
      console.log(`Usuario actualizado: ${id}, ${email}`);
    } 
    else if (eventType === 'user.deleted') {
      // Eliminar el usuario
      const { id } = evt.data;
      
      // 1. Obtener el usuario de Prisma antes de eliminarlo
      const prismaUser = await prisma.user.findUnique({
        where: { clerkUserId: id },
      });
      
      if (prismaUser) {
        // 2. Eliminar el usuario de Supabase
        const { error: supabaseError } = await adminSupabase
          .from('users')
          .delete()
          .eq('clerk_user_id', id);
        
        if (supabaseError) {
          console.error('Error al eliminar usuario de Supabase:', supabaseError);
        }
        
        // 3. Eliminar el usuario de Prisma
        await prisma.user.delete({
          where: { clerkUserId: id },
        });
      }
      
      console.log(`Usuario eliminado: ${id}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error al procesar evento ${eventType}:`, error);
    return new NextResponse(`Error al procesar el webhook: ${error.message}`, { status: 500 });
  }
} 