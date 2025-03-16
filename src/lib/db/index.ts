import { PrismaClient } from '@prisma/client';

// Este archivo exporta una instancia del cliente de Prisma para usar en toda la aplicación
// Utilizamos un enfoque singleton para evitar múltiples instancias en desarrollo

// Declaramos una variable global para el cliente de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Creamos una instancia del cliente de Prisma, reutilizando la global en desarrollo
export const prisma = global.prisma || new PrismaClient();

// Guardamos la instancia en la variable global en entornos que no son de producción
// para evitar múltiples instancias en desarrollo con hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 