# ⚡ EXECUTAR AGORA - SQL Atualizado

## 🔴 AÇÃO URGENTE

O SQL foi **completamente atualizado** com as novas estruturas corretas.

---

## 🗄️ Executar em 3 Bancos

### **1. FRANCA CRED**
https://mhtxyxizfnxupwmilith.supabase.co

### **2. MOGIANA CRED**
https://eemfnpefgojllvzzaimu.supabase.co

### **3. LITORAL CRED**
https://dtifsfzmnjnllzzlndxv.supabase.co

---

## 📄 SQL Completo (Copiar e Colar)

```sql
-- 1. Atualizar tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);

-- 2. Criar tabela emergency_contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_name TEXT,
  client_cpf TEXT,
  client_email TEXT,
  client_phone TEXT,
  created_by_name TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_created_by ON emergency_contacts(created_by);

-- 3. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para emergency_contacts
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read emergency_contacts"
ON emergency_contacts FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert emergency_contacts"
ON emergency_contacts FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update emergency_contacts"
ON emergency_contacts FOR UPDATE TO public USING (true) WITH CHECK (true);
```

---

## ✅ O Que Mudou

### **Campos Users:**
- ✅ `rg` = TEXT (aceita letras)
- ✅ `birth_date` = DATE (data de nascimento)
- ✅ `address` = TEXT (endereço completo)

### **Nova Tabela:**
- ✅ `emergency_contacts` criada
- ✅ Com nome e telefone separados
- ✅ Relacionada com users via client_id

### **Formulário:**
- ✅ Endereço em vez de cidade
- ✅ RG aceita texto
- ✅ Contato emergência: nome E telefone

---

## 🧪 Testar Depois

```bash
cd mobile
npm start
```

1. Criar nova conta
2. Preencher endereço completo
3. ✅ Deve salvar corretamente

---

**Execute o SQL nos 3 bancos e está pronto! 🚀**

**Arquivo completo:** `supabase/migration-complete.sql`
