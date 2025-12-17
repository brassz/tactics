# ⚡ FIX: Atualizar Cache do Supabase

## ❌ Problema

O campo `address` existe, mas o Supabase não atualizou o cache do schema.

---

## 🔧 Solução

Execute o SQL abaixo em **CADA banco (3x)**:

### **1. FRANCA CRED**
https://mhtxyxizfnxupwmilith.supabase.co

### **2. MOGIANA CRED**
https://eemfnpefgojllvzzaimu.supabase.co

### **3. LITORAL CRED**
https://dtifsfzmnjnllzzlndxv.supabase.co

---

## 📄 SQL para Executar

```sql
-- Recriar campo (força cache)
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE users ADD COLUMN address TEXT;

-- Recriar índice
DROP INDEX IF EXISTS idx_users_address;
CREATE INDEX idx_users_address ON users(address);

-- Garantir outros campos
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert users" ON users;
CREATE POLICY "Allow public insert users"
ON users FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read users" ON users;
CREATE POLICY "Allow public read users"
ON users FOR SELECT TO public USING (true);

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
```

---

## ✅ Depois de Executar

1. **Aguarde 5 segundos** (cache atualizar)
2. **Recarregue o app** (R no terminal)
3. **Teste o cadastro** novamente

---

## 🎯 Alternativa Rápida

Se não quiser executar SQL, pode:

1. Ir no **Dashboard do Supabase**
2. **Settings** → **API**
3. Clicar em **"Reload Schema Cache"**
4. Fazer isso nos 3 bancos

---

**Execute e teste! 🚀**
