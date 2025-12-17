# 🎯 Banco Único - Configuração Final

## ✅ Estrutura Simplificada

### **UM ÚNICO Supabase para TUDO:**
- **URL:** https://zwazrwqrbghdicywipaq.supabase.co
- **Usado para:**
  - ✅ Dados dos clientes (tabela `clients`)
  - ✅ Dados dos admins (tabela `admins`)
  - ✅ Documentos (Storage `user-documents`)
  - ✅ Todas as 3 empresas

---

## 🏢 Como Funciona o Multi-Tenant

### **Banco Único + Campo `company`:**
```sql
-- Todos os clientes no mesmo banco
SELECT * FROM clients WHERE company = 'franca';   -- Clientes da FRANCA
SELECT * FROM clients WHERE company = 'mogiana';  -- Clientes da MOGIANA
SELECT * FROM clients WHERE company = 'litoral';  -- Clientes da LITORAL
```

### **Admin:**
- Escolhe empresa no login
- Sistema filtra dados por `company`
- Vê apenas clientes da empresa selecionada

### **Cliente:**
- Cadastro salvo com `company` (empresa padrão ou selecionada)
- Login busca por CPF
- Acessa seus próprios dados

---

## 📊 Estrutura das Tabelas

### **Tabela `clients`:**
- id
- cpf
- name
- phone
- email
- address
- rg
- birth_date
- **company** ← NOVO (franca/mogiana/litoral)
- created_at
- updated_at

### **Tabela `admins`:**
- id
- cpf
- name
- email
- phone
- address
- rg
- birth_date
- created_at
- updated_at

### **Tabela `emergency_contacts`:**
- id
- client_id
- name
- phone
- client_name
- client_cpf
- client_email
- client_phone
- created_at
- updated_at

---

## 🔧 SQL para Executar

Execute APENAS no banco **zwazrwqrbghdicywipaq**:

```sql
-- Adicionar campo company na tabela clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'franca';

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- Adicionar outros campos
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_address ON clients(address);
CREATE INDEX IF NOT EXISTS idx_clients_rg ON clients(rg);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Allow public insert clients" ON clients;
CREATE POLICY "Allow public insert clients"
ON clients FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read clients" ON clients;
CREATE POLICY "Allow public read clients"
ON clients FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public update clients" ON clients;
CREATE POLICY "Allow public update clients"
ON clients FOR UPDATE TO public USING (true) WITH CHECK (true);
```

---

## ✅ O Que Foi Alterado

### **1. Config Simplificado** ✅
- Arquivo: `mobile/config/companies.js`
- Uma única URL e KEY do Supabase
- Lista de empresas apenas com nome

### **2. Supabase Único** ✅
- Arquivo: `mobile/lib/supabaseMulti.js`
- Uma instância única para tudo
- `getSupabase()` sempre retorna a mesma instância

### **3. RegisterScreen** ✅
- Salva campo `company` no cliente
- Identifica qual empresa o cliente pertence

---

## 🔄 Fluxo Completo

### **Cadastro Cliente:**
```
1. Cliente cria conta
2. Sistema salva em `clients` com:
   - Todos os dados
   - company: 'franca' (padrão)
3. Upload documentos no Storage
```

### **Login Admin:**
```
1. Admin insere CPF
2. Sistema busca em `admins`
3. Mostra seleção de empresa
4. Admin escolhe FRANCA/MOGIANA/LITORAL
5. Sistema salva empresa selecionada
6. Painel admin filtra por `company`
```

### **Login Cliente:**
```
1. Cliente insere CPF
2. Sistema busca em `clients`
3. Se aprovado, faz login
```

---

## 🎯 Benefícios

### **Simplicidade:**
- ✅ Um único banco de dados
- ✅ Mais fácil de gerenciar
- ✅ Um backup
- ✅ Menos configuração

### **Multi-Tenant Lógico:**
- ✅ Dados separados por `company`
- ✅ Admin vê apenas sua empresa
- ✅ Isolamento lógico

### **Escalabilidade:**
- ✅ Fácil adicionar nova empresa
- ✅ Apenas adicionar valor em `company`
- ✅ Sem configurar novo banco

---

**Tudo simplificado! Execute o SQL e teste! 🚀**
