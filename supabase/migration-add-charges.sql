-- Migration: Add charges table and phone/email fields to users
-- Execute this SQL in your Supabase SQL Editor to add new features

-- Add telefone and email columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create cobrancas table if it doesn't exist
CREATE TABLE IF NOT EXISTS cobrancas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  descricao TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'atrasado')),
  link_pagamento TEXT,
  mensagem_whatsapp TEXT,
  enviado_whatsapp BOOLEAN DEFAULT FALSE,
  data_envio_whatsapp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_cobrancas_user ON cobrancas(id_user);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON cobrancas(status);
CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON cobrancas(data_vencimento);

-- Enable Row Level Security
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;

-- Create policy for cobrancas
DROP POLICY IF EXISTS "Enable all access for cobrancas" ON cobrancas;
CREATE POLICY "Enable all access for cobrancas" ON cobrancas FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cobrancas_updated_at ON cobrancas;
CREATE TRIGGER update_cobrancas_updated_at BEFORE UPDATE ON cobrancas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing users query for the admin panel
-- This is informational - no need to run, just shows what queries to use
-- SELECT *, users(nome, cpf, telefone) FROM pagamentos;
-- SELECT *, users(nome, cpf, telefone) FROM cobrancas;
