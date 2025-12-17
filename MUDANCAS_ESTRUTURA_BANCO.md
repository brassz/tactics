# 🔄 Mudanças na Estrutura do Banco de Dados

## ✅ Alterações Implementadas

### **1. Campo RG**
- **ANTES:** Numérico (apenas números)
- **DEPOIS:** TEXT (aceita letras e números)
- **Motivo:** RGs podem ter letras (ex: 46.449.290-7)

### **2. Campo Cidade → Endereço**
- **ANTES:** `cidade` VARCHAR(100)
- **DEPOIS:** `address` TEXT
- **Motivo:** Endereço completo precisa de mais espaço
- **Formato:** "Rua Perola Byngton 279 Casa 2, Pq Bitaru - São Vicente SP"

### **3. Data de Nascimento**
- **ANTES:** `data_nascimento` DATE
- **DEPOIS:** `birth_date` DATE
- **Motivo:** Padronização com estrutura existente

### **4. Contato de Emergência → Tabela Separada**
- **ANTES:** Campo único `contato_emergencia` na tabela users
- **DEPOIS:** Tabela `emergency_contacts` separada

---

## 📊 Nova Tabela: emergency_contacts

```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),  -- FK para users
  name TEXT NOT NULL,                   -- Nome do contato
  phone TEXT NOT NULL,                  -- Telefone do contato
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  client_name TEXT,                     -- Dados do cliente (desnormalizados)
  client_cpf TEXT,
  client_email TEXT,
  client_phone TEXT,
  created_by_name TEXT
);
```

---

## 🗄️ SQL Completo para Executar

### **EXECUTAR EM CADA BANCO (3x):**

**1. FRANCA CRED:** https://mhtxyxizfnxupwmilith.supabase.co
**2. MOGIANA CRED:** https://eemfnpefgojllvzzaimu.supabase.co
**3. LITORAL CRED:** https://dtifsfzmnjnllzzlndxv.supabase.co

### **SQL:**

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

## 📝 Mudanças no Código

### **RegisterScreen.js:**

**ANTES:**
```javascript
const [cidade, setCidade] = useState('');
const [contatoEmergencia, setContatoEmergencia] = useState('');
```

**DEPOIS:**
```javascript
const [endereco, setEndereco] = useState('');
const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('');
```

### **Salvamento:**

**ANTES:**
```javascript
{
  cpf,
  nome,
  telefone: celular,
  email,
  cidade,
  rg: rg || null,
  data_nascimento: dataNascimentoSQL,
  contato_emergencia: contatoEmergencia || null,
  status: 'pendente',
}
```

**DEPOIS:**
```javascript
// 1. Criar usuário
{
  cpf,
  nome,
  telefone: celular,
  email,
  address: endereco,
  rg: rg || null,
  birth_date: birthDateSQL,
  status: 'pendente',
}

// 2. Criar contato de emergência (tabela separada)
{
  client_id: data.id,
  name: contatoEmergenciaNome,
  phone: contatoEmergenciaTelefone,
  client_name: nome,
  client_cpf: cpf,
  client_email: email,
  client_phone: celular,
}
```

---

## 🎨 Interface do Formulário

### **ANTES:**
```
- CPF *
- Nome *
- Celular *
- Email *
- Cidade *
- RG
- Data Nascimento
- Contato Emergência (só telefone)
```

### **DEPOIS:**
```
- CPF *
- Nome *
- Celular *
- Email *
- Endereço * (completo com rua, número, bairro, cidade, estado)
- RG (aceita texto)
- Data Nascimento
- Contato Emergência - Nome
- Contato Emergência - Telefone
```

---

## ✅ Benefícios

### **1. Endereço Completo**
- Mais informação
- Formato real: "Rua Perola Byngton 279 Casa 2, Pq Bitaru - São Vicente SP"

### **2. RG Flexível**
- Aceita qualquer formato
- Com ou sem pontos/traços
- Com letras se necessário

### **3. Contato de Emergência Estruturado**
- Nome E telefone separados
- Dados do cliente duplicados para consulta rápida
- Histórico de quem criou
- Timestamps automáticos

### **4. Padronização**
- `birth_date` em vez de `data_nascimento`
- Consistente com estrutura existente
- Melhor para integrações

---

## 🧪 Como Testar

### **1. Cadastro Novo:**
```
1. Abrir app
2. Criar conta
3. Preencher:
   - Endereço: "Rua teste 123, Centro - São Paulo SP"
   - RG: "46.449.290-7" (com ponto e traço)
   - Contato Emergência Nome: "Alexandre Blenat Botelho"
   - Contato Emergência Tel: "13940233011"
4. ✅ Salva corretamente
5. ✅ Cria registro em emergency_contacts
```

### **2. Verificar no Banco:**
```sql
-- Ver usuário
SELECT id, nome, cpf, address, rg, birth_date FROM users WHERE cpf = '...';

-- Ver contato de emergência
SELECT * FROM emergency_contacts WHERE client_cpf = '...';
```

---

## 📋 Checklist

### **SQL:**
- [ ] Executar em FRANCA CRED
- [ ] Executar em MOGIANA CRED
- [ ] Executar em LITORAL CRED
- [ ] Verificar tabela emergency_contacts criada
- [ ] Verificar campos users atualizados

### **Teste:**
- [ ] Cadastro com endereço completo
- [ ] RG com letras/pontos funciona
- [ ] Contato emergência salva corretamente
- [ ] Dados aparecem no banco

---

**Arquivo SQL completo:** `supabase/migration-complete.sql`

Execute nos 3 bancos e teste! 🚀
