-- Migration: Add payment breakdown fields to pagamentos table
-- Execute this SQL in your Supabase SQL Editor (banco principal: zwazrwqrbghdicywipaq)

-- Add fields for payment breakdown (juros + capital)
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_juros DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_capital DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10, 2) DEFAULT 0;

-- Update existing records: set valor_total = valor if null
UPDATE pagamentos SET valor_total = valor WHERE valor_total IS NULL;
UPDATE pagamentos SET valor_pago = 0 WHERE valor_pago IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_valor_pago ON pagamentos(valor_pago);

