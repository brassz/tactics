# 🏙️ Adicionar Campo CITY - Execute Agora

## 🎯 O Que Mudou

### **Cadastro de Cliente:**
- ✅ Cliente seleciona CIDADE ao criar conta:
  - **FRANCA** → empresa: franca
  - **MOGIANA** → empresa: mogiana
  - **PRAIA GRANDE** → empresa: litoral
- ✅ Admin filtra por empresa para aprovar/reprovar

### **Campos no Banco:**
- `city` → Cidade selecionada (FRANCA, MOGIANA, PRAIA GRANDE)
- `company` → ID da empresa (franca, mogiana, litoral)
- `address` → Endereço completo (rua, número, bairro)

---

## 🗄️ SQL para Executar

**Banco:** https://zwazrwqrbghdicywipaq.supabase.co

**Dashboard** → **SQL Editor** → **Cole e Run:**

```sql
-- Adicionar campo city
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- Adicionar campo company
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);

-- Outros campos
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public insert users'
    ) THEN
        CREATE POLICY "Allow public insert users"
        ON users FOR INSERT TO public WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public read users'
    ) THEN
        CREATE POLICY "Allow public read users"
        ON users FOR SELECT TO public USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public update users'
    ) THEN
        CREATE POLICY "Allow public update users"
        ON users FOR UPDATE TO public USING (true) WITH CHECK (true);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
```

---

## 🎯 Fluxo Completo

### **1. Cliente Cria Conta:**
```
1. Seleciona CIDADE: FRANCA ✓
2. Preenche dados
3. Sistema salva:
   - city: "FRANCA"
   - company: "franca"
   - address: "Rua X, 123"
```

### **2. Admin Faz Login:**
```
1. Admin insere CPF
2. Escolhe empresa: FRANCA CRED
3. Vê apenas clientes onde company = 'franca'
4. Aprova ou reprova
```

---

## 📋 Mapeamento

| Cidade Cliente | Company (DB) | Empresa Admin |
|----------------|--------------|---------------|
| FRANCA         | franca       | FRANCA CRED   |
| MOGIANA        | mogiana      | MOGIANA CRED  |
| PRAIA GRANDE   | litoral      | LITORAL CRED  |

---

## ✅ Após Executar

1. Aguardar 5 segundos
2. Recarregar app (R)
3. Testar cadastro
4. Selecionar cidade
5. Verificar no banco

---

**Execute o SQL e teste! 🚀**

**Arquivo:** `SQL_ADICIONAR_CITY.sql`
