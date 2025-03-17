import { readFileSync } from 'fs';
import { join } from 'path';
import { getServiceSupabase } from '../index';

/**
 * Script para ejecutar migraciones de SQL en Supabase
 * Para ejecutar: 
 * npm run migrate:supabase
 * o
 * ts-node -r tsconfig-paths/register src/lib/supabase/migrations/run_migrations.ts
 */
async function runMigrations() {
  console.log('🚀 Iniciando migraciones en Supabase...');
  
  try {
    // Obtener cliente de Supabase con rol de servicio (admin)
    const supabase = getServiceSupabase();
    
    // Lista de archivos de migración en orden de ejecución
    const migrations = [
      'create_users_table.sql',
      // Añadir más migraciones aquí a medida que se creen
    ];
    
    // Ejecutar cada migración
    for (const migration of migrations) {
      console.log(`⏳ Ejecutando migración: ${migration}`);
      
      // Leer el contenido del archivo SQL
      const sqlPath = join(__dirname, migration);
      const sql = readFileSync(sqlPath, 'utf8');
      
      // Ejecutar SQL en Supabase
      const { error } = await supabase.rpc('pgadmin_exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Error en migración ${migration}:`, error);
      } else {
        console.log(`✅ Migración ${migration} ejecutada con éxito`);
      }
    }
    
    console.log('🎉 Todas las migraciones completadas');
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigrations();
}

export default runMigrations; 