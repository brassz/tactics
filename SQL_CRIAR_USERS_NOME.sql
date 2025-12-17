-- SQL para CRIAR colunas na tabela USERS
-- Execute no banco: https://zwazrwqrbghdicywipaq.supabase.co
-- Campo NOME (português) em vez de NAME

-- Colunas principais
ALTER TABLE users ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_nome ON users(nome);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas
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

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public update users'
    ) THEN
        CREATE POLICY "Allow public update users"
        ON users FOR UPDATE TO public USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
