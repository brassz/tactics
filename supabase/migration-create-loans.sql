-- Migration: Create loans table
-- ⚠️ NOTA: Este SQL NÃO precisa ser executado!
-- O schema de empréstimos (loans) JÁ EXISTE nos bancos das 3 empresas:
-- - FRANCA CRED: https://mhtxyxizfnxupwmilith.supabase.co
-- - MOGIANA CRED: https://eemfnpefgojllvzzaimu.supabase.co
-- - LITORAL CRED: https://dtifsfzmnjnllzzlndxv.supabase.co
--
-- Este arquivo é apenas para referência do schema.

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  idx SERIAL,
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'overdue', 'paid', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  original_amount DECIMAL(10, 2) NOT NULL,
  due_date_manually_changed BOOLEAN DEFAULT FALSE,
  term_days INTEGER NOT NULL DEFAULT 30
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_loans_client_id ON loans(client_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_date ON loans(loan_date);
CREATE INDEX IF NOT EXISTS idx_loans_due_date ON loans(due_date);
CREATE INDEX IF NOT EXISTS idx_loans_created_by ON loans(created_by);

-- Enable Row Level Security
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create policy for loans
DROP POLICY IF EXISTS "Enable all access for loans" ON loans;
CREATE POLICY "Enable all access for loans" ON loans FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

