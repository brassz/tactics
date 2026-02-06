# 💰 Implementação de Empréstimos Automáticos

## ✅ O Que Foi Implementado

Quando um cliente solicita um valor de empréstimo, o sistema agora **automaticamente cria um registro de empréstimo** no banco de dados da empresa (FRANCA, MOGIANA ou LITORAL) com todos os campos necessários.

---

## 📋 Schema do Empréstimo

A tabela `loans` foi criada com os seguintes campos:

```json
{
  "idx": 1,                              // Auto-incremento (SERIAL)
  "id": "043392c6-e7a9-46f5-9bd8-bb8653f6f0a4",  // UUID único
  "client_id": "10d66d67-7a86-4b45-8a13-52bcdb50d974",  // ID do cliente
  "amount": "1000.00",                    // Valor solicitado
  "interest_rate": "30.00",               // Taxa de juros (30%)
  "loan_date": "2025-09-21",              // Data do empréstimo
  "due_date": "2025-10-21",               // Data de vencimento
  "status": "overdue",                    // Status (pending, active, overdue, paid, cancelled)
  "total_amount": "1300.00",              // Valor total (valor + juros)
  "created_by": "5094eb23-a72d-4fec-81f0-85bf403f1fdb",  // ID de quem criou
  "created_at": "2025-09-18 21:56:37.593+00",
  "updated_at": "2025-10-30 20:33:47.539474+00",
  "original_amount": "1000.00",           // Valor original (sem juros)
  "due_date_manually_changed": false,     // Se a data foi alterada manualmente
  "term_days": 30                         // Prazo em dias
}
```

---

## 🗄️ SQL para Executar

**IMPORTANTE:** O schema de empréstimos (`loans`) **já existe** nos bancos das 3 empresas:
- **FRANCA CRED:** https://mhtxyxizfnxupwmilith.supabase.co
- **MOGIANA CRED:** https://eemfnpefgojllvzzaimu.supabase.co
- **LITORAL CRED:** https://dtifsfzmnjnllzzlndxv.supabase.co

**Não é necessário executar SQL!** O schema já está criado.

---

## 🔄 Fluxo de Criação

### **1. Cliente Solicita Empréstimo**

Quando o cliente preenche o formulário de solicitação:

```
Cliente preenche:
- Valor: R$ 1.000,00
- Justificativa: (opcional)
```

### **2. Sistema Processa**

O sistema automaticamente:

1. ✅ Cria registro em `solicitacoes_valores` (banco principal)
2. ✅ Faz upload da captura facial
3. ✅ **Busca empresa do cliente** (`user.company`)
4. ✅ **Busca cliente no banco da empresa** pelo CPF
5. ✅ **Cria registro em `loans` no banco da empresa** com:
   - `amount`: R$ 1.000,00
   - `interest_rate`: 30%
   - `total_amount`: R$ 1.300,00 (valor + 30% de juros)
   - `loan_date`: Data atual
   - `due_date`: Data atual + 30 dias
   - `term_days`: 30 dias
   - `status`: 'pending' (aguardando aprovação)
   - `original_amount`: R$ 1.000,00

---

## 📝 Cálculos Automáticos

### **Valor Total:**
```
total_amount = amount + (amount * interest_rate / 100)
total_amount = 1000 + (1000 * 30 / 100) = 1300
```

### **Data de Vencimento:**
```
due_date = loan_date + term_days
due_date = hoje + 30 dias
```

### **Campos Padrão:**
- `interest_rate`: 30.00% (fixo)
- `term_days`: 30 dias (fixo)
- `status`: 'pending' (aguardando aprovação)
- `due_date_manually_changed`: false

---

## 📁 Arquivos Modificados

### **1. `mobile/screens/RequestScreen.js`** ✅
- Modificado `submitRequest()` para criar empréstimo no banco da empresa
- Busca empresa do cliente (`user.company`)
- Busca cliente no banco da empresa pelo CPF
- Cria empréstimo no banco correto (FRANCA, MOGIANA ou LITORAL)
- Cálculo automático de `total_amount`
- Cálculo automático de `due_date`
- Preenchimento de todos os campos obrigatórios

---

## 🎯 Próximos Passos

1. **Teste a funcionalidade** criando uma nova solicitação
2. **Verifique** se o empréstimo foi criado corretamente na tabela `loans` do banco da empresa

---

## 🔍 Verificação

Após criar uma solicitação, verifique no banco da empresa correspondente:

**FRANCA CRED:**
```sql
SELECT * FROM loans 
WHERE client_id = 'ID_DO_CLIENTE' 
ORDER BY created_at DESC 
LIMIT 1;
```

**MOGIANA CRED:**
```sql
SELECT * FROM loans 
WHERE client_id = 'ID_DO_CLIENTE' 
ORDER BY created_at DESC 
LIMIT 1;
```

**LITORAL CRED:**
```sql
SELECT * FROM loans 
WHERE client_id = 'ID_DO_CLIENTE' 
ORDER BY created_at DESC 
LIMIT 1;
```

O empréstimo deve ter sido criado automaticamente no banco da empresa do cliente com todos os campos preenchidos.

---

## ⚠️ Observações

- O empréstimo é criado **imediatamente** quando a solicitação é feita
- O empréstimo é criado no **banco da empresa do cliente** (FRANCA, MOGIANA ou LITORAL)
- O sistema busca automaticamente o cliente no banco da empresa pelo CPF
- O `client_id` usado é o ID do cliente no banco da empresa (tabela `clients`)
- O status inicial é `pending` (aguardando aprovação)
- A taxa de juros é fixa em 30%
- O prazo padrão é de 30 dias
- Se houver erro ao criar o empréstimo, a solicitação ainda é criada (não interrompe o fluxo)

---

**Implementado e pronto para uso! 🎉**

