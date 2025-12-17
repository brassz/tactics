-- Fix: Atualizar Cache do Supabase
-- Executar EM CADA BANCO (FRANCA, MOGIANA, LITORAL)

-- 1. Recriar o campo (força atualização do cache)
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE users ADD COLUMN address TEXT;

-- 2. Recriar índice
DROP INDEX IF EXISTS idx_users_address;
CREATE INDEX idx_users_address ON users(address);

-- 3. Garantir que outros campos existem
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);

-- 5. Atualizar políticas RLS (se necessário)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (ajustar conforme necessidade)
DROP POLICY IF EXISTS "Allow public insert users" ON users;
CREATE POLICY "Allow public insert users"
ON users FOR INSERT
TO public
WITH CHECK (true);

-- Permitir SELECT público (ajustar conforme necessidade)
DROP POLICY IF EXISTS "Allow public read users" ON users;
CREATE POLICY "Allow public read users"
ON users FOR SELECT
TO public
USING (true);

-- 6. IMPORTANTE: Recarregar schema cache
NOTIFY pgrst, 'reload schema';
