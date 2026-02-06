-- Migration: Create withdrawal_requests table
-- Execute this SQL in your Supabase SQL Editor (banco principal: zwazrwqrbghdicywipaq)

-- Create withdrawal_requests table
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

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_solicitacao ON withdrawal_requests(id_solicitacao);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(id_user);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Enable Row Level Security
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for withdrawal_requests
DROP POLICY IF EXISTS "Enable all access for withdrawal_requests" ON withdrawal_requests;
CREATE POLICY "Enable all access for withdrawal_requests" ON withdrawal_requests FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

