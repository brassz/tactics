-- Migration: Create emergency_contacts table
-- Execute this SQL in your Supabase SQL Editor (banco principal: zwazrwqrbghdicywipaq)

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  client_name TEXT,
  client_cpf TEXT,
  client_email TEXT,
  client_phone TEXT,
  created_by_name TEXT
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_created_by ON emergency_contacts(created_by);

-- Enable Row Level Security
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for emergency_contacts
DROP POLICY IF EXISTS "Enable all access for emergency_contacts" ON emergency_contacts;
CREATE POLICY "Enable all access for emergency_contacts" ON emergency_contacts FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

