# 🔧 Correção de Erros - Empréstimo e Contato de Emergência

## ❌ Erros Encontrados

### **1. Tabela `emergency_contacts` não existe**
```
Error creating emergency contact: Could not find the table 'public.emergency_contacts'
```

### **2. Constraint `loans_term_days_check` violado**
```
Error creating loan: new row for relation "loans" violates check constraint "loans_term_days_check"
```

---

## ✅ Soluções

### **1. Criar Tabela `emergency_contacts`**

**Banco:** https://zwazrwqrbghdicywipaq.supabase.co (banco principal)

**Execute o SQL:**
- Arquivo: `supabase/migration-create-emergency-contacts.sql`

Ou execute diretamente:

```sql
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

-- Create indices
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_created_by ON emergency_contacts(created_by);

-- Enable Row Level Security
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Enable all access for emergency_contacts" ON emergency_contacts;
CREATE POLICY "Enable all access for emergency_contacts" ON emergency_contacts FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### **2. Verificar Constraint `term_days` no Banco da Empresa**

O erro indica que há um CHECK constraint na tabela `loans` que limita os valores de `term_days`.

**Verifique o constraint em cada banco da empresa:**

**FRANCA CRED:** https://mhtxyxizfnxupwmilith.supabase.co
**MOGIANA CRED:** https://eemfnpefgojllvzzaimu.supabase.co
**LITORAL CRED:** https://dtifsfzmnjnllzzlndxv.supabase.co
**IMPERATRIZ CRED:** https://eppzphzwwpvpoocospxy.supabase.co

**Execute para ver o constraint:**
```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'loans'::regclass
AND conname LIKE '%term_days%';
```

**Se o constraint limitar o range (ex: term_days > 0 AND term_days <= 365), o código já foi ajustado para garantir valores válidos.**

---

## 🔧 Correções no Código

### **RequestScreen.js - Cálculo de term_days**

O código foi atualizado para garantir que `term_days` seja um inteiro válido:

```javascript
// Calcular term_days baseado na diferença real entre as datas
// Garantir que seja um número inteiro válido (entre 1 e 365 dias)
const termDays = Math.max(1, Math.min(365, Math.ceil((dueDate - loanDate) / (1000 * 60 * 60 * 24))));

// E ao inserir:
term_days: Math.floor(termDays), // Garantir que seja inteiro
```

---

## 📋 Checklist

- [ ] Executar SQL para criar `emergency_contacts` no banco principal
- [ ] Verificar constraint `term_days` nos bancos das empresas
- [ ] Testar criação de empréstimo novamente
- [ ] Testar cadastro com contato de emergência

---

**Após executar o SQL, os erros devem ser resolvidos! ✅**

