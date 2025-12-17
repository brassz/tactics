# ⚡ EXECUTAR AGORA - Criar Colunas USERS

## ❌ Erro Atual

```
Could not find the 'name' column of 'users' in the schema cache
```

**Causa:** Tabela `users` não tem as colunas necessárias

---

## 🔍 Passo 1: Verificar Estrutura Atual

**Execute primeiro para ver quais colunas existem:**

```sql
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
```

**Cole aqui o resultado** 👇

---

## ✅ Passo 2: Criar Todas as Colunas

**Banco:** https://zwazrwqrbghdicywipaq.supabase.co

**Dashboard** → **SQL Editor** → **Cole e Run:**

```sql
-- SEGURO: Só adiciona se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

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

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
```

---

## 📋 Colunas Necessárias

| Coluna       | Tipo        | Descrição                  |
|--------------|-------------|----------------------------|
| id           | UUID        | ID único (já existe)       |
| cpf          | TEXT        | CPF do cliente             |
| name         | TEXT        | Nome completo              |
| phone        | TEXT        | Celular                    |
| email        | TEXT        | Email                      |
| city         | TEXT        | FRANCA/MOGIANA/PRAIA GRANDE|
| address      | TEXT        | Endereço completo          |
| rg           | TEXT        | RG (opcional)              |
| birth_date   | DATE        | Data nascimento (opcional) |
| company      | TEXT        | franca/mogiana/litoral     |
| status       | TEXT        | pendente/aprovado/reprovado|
| photo        | TEXT        | URL da foto (opcional)     |
| created_at   | TIMESTAMPTZ | Data criação               |
| updated_at   | TIMESTAMPTZ | Data atualização           |

---

## 🚀 Depois de Executar

1. Aguardar **10 segundos** (cache reload)
2. Recarregar app (R)
3. Testar cadastro
4. ✅ Deve funcionar!

---

**Execute o SQL COMPLETO e teste! 🎉**

**Arquivos:**
- `VERIFICAR_COLUNAS_USERS.sql` (verificar primeiro)
- `CRIAR_COLUNAS_USERS.sql` (executar depois)
