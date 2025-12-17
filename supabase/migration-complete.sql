-- Migração Completa para os 3 Bancos de Dados
-- Executar no SQL Editor do Supabase EM CADA EMPRESA
-- FRANCA CRED, MOGIANA CRED, LITORAL CRED

-- 1. Atualizar tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);

-- 2. Criar tabela emergency_contacts (contatos de emergência)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_name TEXT,
  client_cpf TEXT,
  client_email TEXT,
  client_phone TEXT,
  created_by_name TEXT
);

-- Criar índices para emergency_contacts
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_created_by ON emergency_contacts(created_by);

-- 3. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para emergency_contacts
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies para emergency_contacts (adaptar conforme necessidade)
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (ajustar conforme necessidade)
CREATE POLICY "Allow public read emergency_contacts"
ON emergency_contacts FOR SELECT
TO public
USING (true);

-- Permitir insert público (ajustar conforme necessidade)
CREATE POLICY "Allow public insert emergency_contacts"
ON emergency_contacts FOR INSERT
TO public
WITH CHECK (true);

-- Permitir update público (ajustar conforme necessidade)
CREATE POLICY "Allow public update emergency_contacts"
ON emergency_contacts FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
