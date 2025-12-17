# ⚡ EXECUTAR ESTE SQL AGORA

## 🎯 Banco Único

**URL:** https://zwazrwqrbghdicywipaq.supabase.co

**Dashboard** → **SQL Editor** → **Cole o SQL abaixo** → **Run**

---

## 📄 SQL (Copiar e Colar)

```sql
-- Adicionar campo company
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);

-- Adicionar outros campos
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Índices
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

## ✅ Depois

1. Aguardar 5 segundos
2. Recarregar app (R)
3. Testar cadastro

---

**Execute e teste! 🚀**

**Arquivo:** `SQL_FINAL_USERS.sql`
