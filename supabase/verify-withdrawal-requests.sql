-- Script para verificar e corrigir a tabela withdrawal_requests
-- Execute este SQL no Supabase SQL Editor do banco principal (zwazrwqrbghdicywipaq)

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'withdrawal_requests'
) AS table_exists;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'withdrawal_requests'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'withdrawal_requests';

-- 4. Se a tabela não existir ou estiver incorreta, criar/corrigir:
-- (Execute apenas se necessário)

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_solicitacao UUID NOT NULL REFERENCES solicitacoes_valores(id) ON DELETE CASCADE,
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  chave_pix VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  data_pagamento TIMESTAMP,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_solicitacao ON withdrawal_requests(id_solicitacao);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(id_user);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Habilitar RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas e criar nova
DROP POLICY IF EXISTS "Enable all access for withdrawal_requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Allow all operations on withdrawal_requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Public access to withdrawal_requests" ON withdrawal_requests;

-- Criar política permissiva para todas as operações
CREATE POLICY "Enable all access for withdrawal_requests" 
ON withdrawal_requests 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificar se a função update_updated_at_column existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at 
BEFORE UPDATE ON withdrawal_requests
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar dados existentes
SELECT COUNT(*) as total_saques FROM withdrawal_requests;

-- 6. Testar inserção (opcional - remover após teste)
-- INSERT INTO withdrawal_requests (id_solicitacao, id_user, nome_completo, cpf, chave_pix, status)
-- VALUES (
--   (SELECT id FROM solicitacoes_valores LIMIT 1),
--   (SELECT id FROM users LIMIT 1),
--   'Teste',
--   '12345678901',
--   'teste@teste.com',
--   'pendente'
-- );

