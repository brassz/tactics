# 🔄 Fluxo de Aprovação de Clientes

## 📋 Como Funciona

### **1️⃣ Cliente se Cadastra**

**Onde:** Tabela `users` no banco **zwazrwqrbghdicywipaq**

```javascript
{
  cpf: "12345678900",
  nome: "João Silva",
  phone: "11999999999",
  email: "joao@email.com",
  city: "FRANCA",           // Cidade selecionada
  address: "Rua X, 123",
  company: "franca",         // Identifica empresa
  status: "pendente",        // Aguardando aprovação
}
```

---

### **2️⃣ Admin Visualiza Cadastro**

**Tela:** Admin Users Screen

- Admin faz login e escolhe empresa (FRANCA CRED)
- Vê lista de cadastros pendentes
- Clica no cadastro para visualizar detalhes

---

### **3️⃣ Admin Aprova Cadastro**

**O que acontece:**

1. **Copia dados** para tabela `clients` no banco da **FRANCA CRED**
   ```
   Banco: https://mhtxyxizfnxupwmilith.supabase.co
   Tabela: clients
   ```

2. **Atualiza status** na tabela `users` do banco único
   ```
   status: "pendente" → "aprovado"
   ```

3. **Cliente agora existe em 2 lugares:**
   - `users` (banco único) → status aprovado
   - `clients` (banco FRANCA) → dados completos

---

## 🗄️ Estrutura dos Bancos

### **Banco Único (zwazrwqrbghdicywipaq)**
```
Tabela: users
- Cadastros pendentes
- Cadastros aprovados (histórico)
- Cadastros reprovados
```

### **Banco FRANCA CRED (mhtxyxizfnxupwmilith)**
```
Tabela: clients
- Apenas clientes APROVADOS da FRANCA
- Usado para operações da empresa
```

### **Banco MOGIANA CRED (eemfnpefgojllvzzaimu)**
```
Tabela: clients
- Apenas clientes APROVADOS da MOGIANA
- Usado para operações da empresa
```

### **Banco LITORAL CRED (dtifsfzmnjnllzzlndxv)**
```
Tabela: clients
- Apenas clientes APROVADOS do LITORAL
- Usado para operações da empresa
```

---

## 🎯 Exemplo Completo

### **Passo 1: Cliente se Cadastra**
```
Cliente escolhe: PRAIA GRANDE
↓
Salvo em: zwazrwqrbghdicywipaq/users
Status: pendente
Company: litoral
```

### **Passo 2: Admin Aprova**
```
Admin acessa: LITORAL CRED
↓
Visualiza: Cliente pendente
↓
Clica: Aprovar
```

### **Passo 3: Sistema Processa**
```
1. Copia dados → dtifsfzmnjnllzzlndxv/clients
2. Atualiza status → zwazrwqrbghdicywipaq/users (aprovado)
3. Mostra sucesso
```

### **Resultado:**
```
✅ Banco Único (users):
   - CPF: 12345678900
   - Status: aprovado
   - Company: litoral

✅ Banco LITORAL (clients):
   - CPF: 12345678900
   - Nome: João Silva
   - (todos os dados)
```

---

## 🔒 Segurança

- Cada empresa vê apenas seus clientes
- Dados ficam separados por banco
- Histórico mantido no banco único
- Não há risco de conflito entre empresas

---

## ✅ Benefícios

1. **Centralização inicial:** Todos os cadastros em um lugar
2. **Separação após aprovação:** Cada empresa tem seus dados
3. **Histórico completo:** Banco único mantém todos os registros
4. **Isolamento:** Dados de cada empresa em banco próprio

---

**Implementado e funcionando! 🎉**
