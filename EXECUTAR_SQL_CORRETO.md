# ✅ SQL CORRETO - Tabela CLIENTS

## 🎯 Tabela Correta: `clients` (não users)

Execute este SQL **seguro** nos 3 bancos:

---

## 📄 SQL para Executar

```sql
-- Adicionar campo address
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
CREATE INDEX IF NOT EXISTS idx_clients_address ON clients(address);

-- Adicionar outros campos
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;
CREATE INDEX IF NOT EXISTS idx_clients_rg ON clients(rg);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas
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

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
```

---

## 🗄️ Executar em:

1. **FRANCA:** https://mhtxyxizfnxupwmilith.supabase.co
2. **MOGIANA:** https://eemfnpefgojllvzzaimu.supabase.co
3. **LITORAL:** https://dtifsfzmnjnllzzlndxv.supabase.co

---

## ✅ Depois

1. Aguardar 5 segundos
2. Recarregar app (R)
3. Testar cadastro

---

**Arquivo SQL:** `ADD_ADDRESS_CLIENTS.sql`
