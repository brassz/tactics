# 📘 Exemplos de Uso da API Nexus PIX

Este documento contém exemplos práticos de como usar todas as funcionalidades da API PIX.

## 🔧 Configuração Inicial

Base URL: `http://localhost:3000/api`

Todos os exemplos usam `curl`, mas você pode usar qualquer cliente HTTP (Postman, Insomnia, etc).

---

## 🏦 1. GERENCIAMENTO DE CONTAS

### 1.1 Criar uma Nova Conta (CPF)

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Oliveira",
    "document": "111.222.333-44",
    "documentType": "CPF",
    "balance": 2500.00
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "id": "abc123...",
    "name": "Pedro Oliveira",
    "document": "111.222.333-44",
    "documentType": "CPF",
    "balance": 2500,
    "createdAt": "2024-11-26T..."
  }
}
```

### 1.2 Criar uma Conta Empresarial (CNPJ)

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions LTDA",
    "document": "98.765.432/0001-10",
    "documentType": "CNPJ",
    "balance": 50000.00
  }'
```

### 1.3 Listar Todas as Contas

```bash
curl http://localhost:3000/api/accounts
```

### 1.4 Consultar uma Conta Específica

```bash
curl http://localhost:3000/api/accounts/{accountId}
```

### 1.5 Consultar Saldo

```bash
curl http://localhost:3000/api/accounts/{accountId}/balance
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "accountId": "abc123...",
    "balance": 2500.00
  }
}
```

### 1.6 Obter Estatísticas Gerais

```bash
curl http://localhost:3000/api/accounts/stats/general
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalAccounts": 5,
    "totalPixKeys": 8,
    "totalTransactions": 12,
    "completedTransactions": 10,
    "totalVolume": 15500.00,
    "averageTransaction": 1550.00,
    "qrCodesGenerated": 3
  }
}
```

---

## 🔑 2. CHAVES PIX

### 2.1 Cadastrar Chave PIX (CPF)

```bash
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "keyType": "CPF",
    "keyValue": "11122233344"
  }'
```

### 2.2 Cadastrar Chave PIX (Email)

```bash
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "keyType": "EMAIL",
    "keyValue": "pedro@email.com"
  }'
```

### 2.3 Cadastrar Chave PIX (Telefone)

```bash
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "keyType": "PHONE",
    "keyValue": "+5511999998888"
  }'
```

### 2.4 Cadastrar Chave Aleatória

```bash
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "keyType": "RANDOM",
    "keyValue": "abc123-def456-ghi789"
  }'
```

### 2.5 Listar Chaves de uma Conta

```bash
curl http://localhost:3000/api/pix/keys/account/{accountId}
```

### 2.6 Consultar Chave PIX

```bash
curl http://localhost:3000/api/pix/keys/lookup/11122233344
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "pixKey": {
      "id": "key123...",
      "accountId": "abc123...",
      "keyType": "CPF",
      "keyValue": "11122233344",
      "status": "ACTIVE",
      "createdAt": "2024-11-26T..."
    },
    "account": {
      "id": "abc123...",
      "name": "Pedro Oliveira",
      "document": "111.222.333-44",
      "documentType": "CPF"
    }
  }
}
```

### 2.7 Deletar Chave PIX

```bash
curl -X DELETE http://localhost:3000/api/pix/keys/{keyId}
```

---

## 💸 3. TRANSAÇÕES PIX

### 3.1 Enviar PIX (Transferência Básica)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "abc123...",
    "pixKey": "11122233344",
    "amount": 150.50,
    "description": "Pagamento de serviço"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Transação realizada com sucesso",
  "data": {
    "id": "tx123...",
    "txid": "TXN1732627200ABC123",
    "fromAccountId": "abc123...",
    "toAccountId": "def456...",
    "amount": 150.50,
    "description": "Pagamento de serviço",
    "pixKey": "11122233344",
    "status": "COMPLETED",
    "createdAt": "2024-11-26T...",
    "completedAt": "2024-11-26T..."
  }
}
```

### 3.2 Consultar Transação

```bash
curl http://localhost:3000/api/transactions/{transactionId}
```

### 3.3 Listar Todas as Transações

```bash
curl http://localhost:3000/api/transactions
```

### 3.4 Listar Transações de uma Conta

```bash
curl http://localhost:3000/api/transactions/account/{accountId}
```

### 3.5 Estornar Transação

```bash
curl -X POST http://localhost:3000/api/transactions/{transactionId}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Produto não entregue"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estorno realizado com sucesso",
  "data": {
    "refundTransaction": {
      "id": "refund123...",
      "txid": "TXN1732627300XYZ789",
      "fromAccountId": "def456...",
      "toAccountId": "abc123...",
      "amount": 150.50,
      "description": "Estorno: Pagamento de serviço",
      "refundReason": "Produto não entregue",
      "originalTransactionId": "tx123...",
      "status": "COMPLETED"
    },
    "originalTransaction": { ... }
  }
}
```

---

## 📱 4. QR CODE PIX

### 4.1 Gerar QR Code Estático

```bash
curl -X POST http://localhost:3000/api/pix/qrcode/static \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "pixKey": "11122233344",
    "amount": 50.00,
    "description": "Pagamento de pedido #1234"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "QR Code gerado com sucesso",
  "data": {
    "id": "qr123...",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGg...",
    "payload": "{\"version\":\"01\",\"type\":\"STATIC\",...}",
    "txid": "TXN1732627400ABC456"
  }
}
```

### 4.2 Gerar QR Code Dinâmico (com expiração)

```bash
curl -X POST http://localhost:3000/api/pix/qrcode/dynamic \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123...",
    "amount": 100.00,
    "description": "Pagamento com prazo",
    "expiresIn": 30
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "QR Code dinâmico gerado com sucesso",
  "data": {
    "id": "qr456...",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGg...",
    "payload": "{\"version\":\"01\",\"type\":\"DYNAMIC\",...}",
    "txid": "TXN1732627500XYZ123",
    "expiresAt": "2024-11-26T15:30:00.000Z"
  }
}
```

### 4.3 Pagar QR Code

```bash
curl -X POST http://localhost:3000/api/transactions/qrcode/pay \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "abc123...",
    "qrCodePayload": "{\"version\":\"01\",\"type\":\"STATIC\",\"merchantName\":\"Pedro Oliveira\",\"pixKey\":\"11122233344\",\"amount\":50}"
  }'
```

### 4.4 Consultar QR Code

```bash
curl http://localhost:3000/api/pix/qrcode/{qrcodeId}
```

### 4.5 Listar QR Codes de uma Conta

```bash
curl http://localhost:3000/api/pix/qrcode/account/{accountId}
```

---

## 🎯 5. CASOS DE USO COMPLETOS

### 5.1 Fluxo Completo: Criar Conta e Fazer Transferência

```bash
# 1. Criar conta origem
ACCOUNT1=$(curl -s -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Silva",
    "document": "555.666.777-88",
    "documentType": "CPF",
    "balance": 5000.00
  }' | jq -r '.data.id')

# 2. Criar conta destino
ACCOUNT2=$(curl -s -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Costa",
    "document": "999.888.777-66",
    "documentType": "CPF",
    "balance": 1000.00
  }' | jq -r '.data.id')

# 3. Criar chave PIX para conta destino
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT2\",
    \"keyType\": \"CPF\",
    \"keyValue\": \"99988877766\"
  }"

# 4. Fazer transferência
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"fromAccountId\": \"$ACCOUNT1\",
    \"pixKey\": \"99988877766\",
    \"amount\": 250.00,
    \"description\": \"Transferência entre amigos\"
  }"
```

### 5.2 Fluxo Completo: Gerar e Pagar QR Code

```bash
# 1. Obter ID de uma conta existente
ACCOUNT_ID="abc123..."

# 2. Gerar QR Code
QR_PAYLOAD=$(curl -s -X POST http://localhost:3000/api/pix/qrcode/dynamic \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"amount\": 75.50,
    \"description\": \"Pagamento de produto\",
    \"expiresIn\": 30
  }" | jq -r '.data.payload')

# 3. Pagar o QR Code
curl -X POST http://localhost:3000/api/transactions/qrcode/pay \
  -H "Content-Type: application/json" \
  -d "{
    \"fromAccountId\": \"outra-conta-id\",
    \"qrCodePayload\": $QR_PAYLOAD
  }"
```

### 5.3 Fluxo Completo: Transação com Estorno

```bash
# 1. Fazer uma transferência
TX_ID=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "abc123...",
    "pixKey": "11122233344",
    "amount": 300.00,
    "description": "Compra de produto"
  }' | jq -r '.data.id')

# 2. Estornar a transferência
curl -X POST http://localhost:3000/api/transactions/$TX_ID/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Produto com defeito"
  }'
```

---

## 🚨 Tratamento de Erros

### Erro: Saldo Insuficiente

```json
{
  "success": false,
  "message": "Transação falhou",
  "data": {
    "status": "FAILED",
    "failReason": "Saldo insuficiente"
  }
}
```

### Erro: Chave PIX não encontrada

```json
{
  "success": false,
  "error": "Chave PIX não encontrada"
}
```

### Erro: Chave PIX já cadastrada

```json
{
  "success": false,
  "error": "Chave PIX já cadastrada"
}
```

### Erro: Campos obrigatórios faltando

```json
{
  "error": "Dados obrigatórios: fromAccountId, pixKey, amount"
}
```

---

## 💡 Dicas e Boas Práticas

1. **Sempre verifique o saldo antes de fazer transferências**
   ```bash
   curl http://localhost:3000/api/accounts/{accountId}/balance
   ```

2. **Use o lookup de chaves PIX para validar antes de transferir**
   ```bash
   curl http://localhost:3000/api/pix/keys/lookup/{keyValue}
   ```

3. **Consulte as estatísticas para monitorar o sistema**
   ```bash
   curl http://localhost:3000/api/accounts/stats/general
   ```

4. **Guarde o TXID para rastreamento de transações**

5. **QR Codes dinâmicos têm expiração - use o campo `expiresIn`**

6. **Sempre forneça descrições claras nas transações**

---

## 🔍 Testando com JavaScript/Fetch

```javascript
// Exemplo: Criar conta
async function criarConta() {
  const response = await fetch('http://localhost:3000/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'João Teste',
      document: '123.456.789-00',
      documentType: 'CPF',
      balance: 1000
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Exemplo: Enviar PIX
async function enviarPix(fromAccountId, pixKey, amount) {
  const response = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAccountId,
      pixKey,
      amount,
      description: 'Pagamento teste'
    })
  });
  
  const data = await response.json();
  console.log(data);
}
```

---

**🎉 Sistema 100% Funcional e Pronto para Uso!**
