-- Crear la tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  credit_balance INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear políticas RLS (Row Level Security)
-- Necesitas habilitar RLS en la tabla y configurar las políticas apropiadas

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios datos
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_user_id = auth.uid());

-- Política para permitir a los administradores ver todos los datos
CREATE POLICY "Admins can view all data" ON users
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Política para que solo los administradores puedan modificar datos
CREATE POLICY "Admins can modify data" ON users
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 