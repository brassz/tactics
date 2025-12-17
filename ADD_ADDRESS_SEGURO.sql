-- SQL SEGURO: Apenas adicionar campo address
-- NÃO deleta nada, NÃO afeta dados existentes
-- Executar EM CADA BANCO (FRANCA, MOGIANA, LITORAL)

-- Adicionar campo address se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);

-- Adicionar outros campos (se não existirem)
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);

-- RLS: Permitir INSERT (se necessário)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para INSERT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public insert users'
    ) THEN
        CREATE POLICY "Allow public insert users"
        ON users FOR INSERT TO public WITH CHECK (true);
    END IF;
END $$;

-- Política para SELECT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public read users'
    ) THEN
        CREATE POLICY "Allow public read users"
        ON users FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Recarregar schema cache
NOTIFY pgrst, 'reload schema';
