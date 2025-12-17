-- SQL SEGURO: Adicionar campo address na tabela CLIENTS
-- NÃO deleta nada, NÃO afeta dados existentes
-- Executar EM CADA BANCO (FRANCA, MOGIANA, LITORAL)

-- Adicionar campo address se não existir
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_clients_address ON clients(address);

-- Adicionar outros campos (se não existirem)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clients_rg ON clients(rg);

-- RLS: Permitir INSERT (se necessário)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para INSERT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' 
        AND policyname = 'Allow public insert clients'
    ) THEN
        CREATE POLICY "Allow public insert clients"
        ON clients FOR INSERT TO public WITH CHECK (true);
    END IF;
END $$;

-- Política para SELECT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' 
        AND policyname = 'Allow public read clients'
    ) THEN
        CREATE POLICY "Allow public read clients"
        ON clients FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Recarregar schema cache
NOTIFY pgrst, 'reload schema';
