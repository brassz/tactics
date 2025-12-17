-- SQL para Banco Único
-- Executar APENAS em: https://zwazrwqrbghdicywipaq.supabase.co

-- 1. Adicionar campo company na tabela clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';

-- 2. Criar índice para company
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- 3. Adicionar outros campos necessários
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_clients_address ON clients(address);
CREATE INDEX IF NOT EXISTS idx_clients_rg ON clients(rg);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- 5. RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público
DROP POLICY IF EXISTS "Allow public insert clients" ON clients;
CREATE POLICY "Allow public insert clients"
ON clients FOR INSERT TO public WITH CHECK (true);

-- Permitir SELECT público
DROP POLICY IF EXISTS "Allow public read clients" ON clients;
CREATE POLICY "Allow public read clients"
ON clients FOR SELECT TO public USING (true);

-- Permitir UPDATE público
DROP POLICY IF EXISTS "Allow public update clients" ON clients;
CREATE POLICY "Allow public update clients"
ON clients FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 6. Criar tabela emergency_contacts (se não existir)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_name TEXT,
  client_cpf TEXT,
  client_email TEXT,
  client_phone TEXT,
  created_by_name TEXT
);

-- Índices emergency_contacts
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id);

-- RLS emergency_contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read emergency_contacts" ON emergency_contacts;
CREATE POLICY "Allow public read emergency_contacts"
ON emergency_contacts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert emergency_contacts" ON emergency_contacts;
CREATE POLICY "Allow public insert emergency_contacts"
ON emergency_contacts FOR INSERT TO public WITH CHECK (true);

-- 7. Recarregar schema
NOTIFY pgrst, 'reload schema';
