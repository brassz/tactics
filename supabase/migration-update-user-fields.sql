-- Adicionar novos campos à tabela users
-- Executar no SQL Editor do Supabase EM CADA EMPRESA

ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
