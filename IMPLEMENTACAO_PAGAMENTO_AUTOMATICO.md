# 💰 Implementação: Pagamento Automático e Abatimento

## ✅ O Que Foi Implementado

### **1. Criação Automática de Pagamento**

Quando o admin aprova uma solicitação de empréstimo, o sistema **automaticamente cria um pagamento** com:

- **Valor Total**: Valor do empréstimo + Juros (30%)
- **Valor Juros**: 30% do valor do empréstimo
- **Valor Capital**: Valor original do empréstimo
- **Valor Pago**: Inicialmente 0
- **Data de Vencimento**: 30 dias (1 mês) após a aprovação
- **Status**: Pendente

### **2. Sistema de Abatimento**

O admin pode registrar pagamentos de três formas:

#### **a) Pagamento Integral**
- Paga o valor total restante
- Marca o pagamento como "Pago"

#### **b) Apenas Juros**
- Paga apenas os juros pendentes
- O capital continua pendente
- Status permanece "Pendente" até quitar tudo

#### **c) Pagamento Parcial**
- Permite pagar qualquer valor
- O sistema abate primeiro os juros, depois o capital
- Status muda para "Pago" apenas quando quitar tudo

---

## 🗄️ SQL para Executar

**IMPORTANTE:** Execute este SQL no banco principal antes de usar:

**Banco:** https://zwazrwqrbghdicywipaq.supabase.co

**Arquivo:** `supabase/migration-add-payment-fields.sql`

```sql
-- Add fields for payment breakdown (juros + capital)
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_juros DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_capital DECIMAL(10, 2);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10, 2) DEFAULT 0;

-- Update existing records: set valor_total = valor if null
UPDATE pagamentos SET valor_total = valor WHERE valor_total IS NULL;
UPDATE pagamentos SET valor_pago = 0 WHERE valor_pago IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_valor_pago ON pagamentos(valor_pago);
```

---

## 📋 Fluxo Completo

### **1. Cliente Solicita Empréstimo**
- Cliente solicita R$ 1.000,00
- Status: "Aguardando"

### **2. Admin Aprova Solicitação**
- Admin clica em "Aprovar"
- Sistema automaticamente:
  - ✅ Atualiza status da solicitação para "Aprovado"
  - ✅ Cria pagamento com:
    - Valor Total: R$ 1.300,00 (R$ 1.000 + 30%)
    - Valor Juros: R$ 300,00
    - Valor Capital: R$ 1.000,00
    - Valor Pago: R$ 0,00
    - Vencimento: 30 dias

### **3. Admin Registra Pagamento**

**Opção A - Pagamento Integral:**
- Admin clica em "Registrar Pagamento"
- Seleciona "Pagamento Integral"
- Valor: R$ 1.300,00 (preenchido automaticamente)
- Sistema marca como "Pago"

**Opção B - Apenas Juros:**
- Admin seleciona "Apenas Juros"
- Valor: R$ 300,00 (preenchido automaticamente)
- Sistema registra R$ 300,00
- Status continua "Pendente" (ainda falta o capital)

**Opção C - Pagamento Parcial:**
- Admin seleciona "Pagamento Parcial"
- Digita qualquer valor (ex: R$ 500,00)
- Sistema abate primeiro juros, depois capital
- Status muda para "Pago" apenas quando quitar tudo

---

## 📁 Arquivos Modificados

### **1. `admin-panel/app/dashboard/requests/page.tsx`**
- Modificado `updateRequestStatus()` para criar pagamento automaticamente ao aprovar
- Calcula valores (total, juros, capital)
- Define vencimento para 30 dias

### **2. `admin-panel/app/dashboard/payments/page.tsx`**
- Adicionado modal de pagamento com opções de abatimento
- Implementado `processPayment()` para processar diferentes tipos de pagamento
- Adicionado campos na interface `Payment` para suportar abatimento
- Modal mostra:
  - Valor Total
  - Valor Juros
  - Valor Capital
  - Valor Já Pago
  - Tipo de Pagamento (Integral/Juros/Parcial)
  - Campo para valor a pagar

### **3. `supabase/migration-add-payment-fields.sql`**
- SQL para adicionar campos de abatimento na tabela `pagamentos`

---

## 🎯 Funcionalidades

### **Visualização de Pagamentos**
- Lista todos os pagamentos
- Mostra valor total, juros, capital e valor já pago
- Status visual (Pendente/Pago)

### **Registro de Pagamento**
- Botão "Registrar Pagamento" em pagamentos pendentes
- Modal com informações detalhadas
- Seleção de tipo de pagamento
- Validação de valores
- Atualização automática de status

### **Cálculo Automático**
- Valor total = Capital + Juros
- Juros = 30% do capital
- Abatimento inteligente (primeiro juros, depois capital)

---

## ⚠️ Observações

1. **Execute o SQL** antes de usar a funcionalidade
2. **Pagamentos antigos** terão `valor_total = valor` e `valor_pago = 0`
3. **Status "Pago"** só é atribuído quando `valor_pago >= valor_total`
4. **Abatimento** sempre prioriza juros antes do capital

---

**Implementado e pronto para uso! 🎉**

