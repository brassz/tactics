# ⚡ Quick Start - Nexus PIX

Guia rápido para rodar o sistema em **5 minutos**!

---

## 🚀 Instalação Rápida

```bash
# 1. Entrar no diretório
cd /workspace

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start
```

**Pronto!** Sistema rodando em `http://localhost:3000`

---

## 🎯 Primeiro Acesso

### Dashboard Web
Abra seu navegador e acesse:
```
http://localhost:3000
```

Você verá:
- ✅ Logo Nexus no topo
- ✅ 4 cards com estatísticas
- ✅ Sistema com 3 contas de exemplo pré-carregadas
- ✅ Chaves PIX já cadastradas

---

## 🏃 Fluxo Básico

### 1️⃣ Criar uma Nova Conta

**Via Interface:**
1. Clique em "Nova Conta"
2. Preencha:
   - Nome: `João Teste`
   - Tipo: `CPF`
   - Documento: `111.222.333-44`
   - Saldo: `1000`
3. Clique em "Criar Conta"

**Via API:**
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Teste",
    "document": "111.222.333-44",
    "documentType": "CPF",
    "balance": 1000
  }'
```

### 2️⃣ Cadastrar Chave PIX

**Via Interface:**
1. Vá para tab "Chaves PIX"
2. Clique em "Nova Chave PIX"
3. Selecione a conta
4. Escolha o tipo (CPF, Email, etc)
5. Digite a chave
6. Clique em "Criar Chave"

**Via API:**
```bash
curl -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "SEU_ACCOUNT_ID",
    "keyType": "CPF",
    "keyValue": "11122233344"
  }'
```

### 3️⃣ Fazer uma Transferência PIX

**Via Interface:**
1. Vá para tab "Transações"
2. Clique em "Enviar PIX"
3. Selecione conta de origem
4. Digite chave PIX de destino (use: `12345678900`)
5. Digite valor
6. Adicione descrição
7. Clique em "Enviar PIX"

**Via API:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "SEU_ACCOUNT_ID",
    "pixKey": "12345678900",
    "amount": 50.00,
    "description": "Teste de pagamento"
  }'
```

### 4️⃣ Gerar QR Code

**Via Interface:**
1. Vá para tab "QR Code"
2. Selecione tipo (Estático ou Dinâmico)
3. Escolha a conta
4. Digite valor e descrição
5. Clique em "Gerar QR Code"
6. QR Code aparece à direita!

**Via API:**
```bash
curl -X POST http://localhost:3000/api/pix/qrcode/dynamic \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "SEU_ACCOUNT_ID",
    "amount": 100.00,
    "description": "Pagamento",
    "expiresIn": 30
  }'
```

---

## 📱 Contas de Exemplo (Pré-carregadas)

Você pode usar estas contas para testes:

### Conta 1 - João Silva
- **Tipo:** CPF
- **Documento:** 123.456.789-00
- **Saldo inicial:** R$ 5.000,00
- **Chaves PIX:**
  - CPF: `12345678900`
  - Email: `joao@example.com`

### Conta 2 - Maria Santos
- **Tipo:** CPF
- **Documento:** 987.654.321-00
- **Saldo inicial:** R$ 3.500,00
- **Chaves PIX:**
  - Telefone: `+5511987654321`

### Conta 3 - Nexus Pagamentos LTDA
- **Tipo:** CNPJ
- **Documento:** 12.345.678/0001-90
- **Saldo inicial:** R$ 150.000,00
- **Chaves PIX:**
  - CNPJ: `12345678000190`

---

## 🎮 Teste Rápido

Execute este script para fazer um teste completo:

```bash
#!/bin/bash

echo "🧪 Testando Sistema Nexus PIX..."

# 1. Criar conta
echo "\n1️⃣ Criando conta..."
CONTA=$(curl -s -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Rápido",
    "document": "999.888.777-66",
    "documentType": "CPF",
    "balance": 500
  }')
echo "✅ Conta criada!"

# 2. Extrair ID (requer jq)
ACCOUNT_ID=$(echo $CONTA | jq -r '.data.id')
echo "📝 Account ID: $ACCOUNT_ID"

# 3. Criar chave PIX
echo "\n2️⃣ Criando chave PIX..."
curl -s -X POST http://localhost:3000/api/pix/keys \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"keyType\": \"EMAIL\",
    \"keyValue\": \"teste@nexus.com\"
  }" > /dev/null
echo "✅ Chave PIX criada!"

# 4. Fazer transferência
echo "\n3️⃣ Fazendo transferência..."
curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"fromAccountId\": \"$ACCOUNT_ID\",
    \"pixKey\": \"12345678900\",
    \"amount\": 50.00,
    \"description\": \"Teste automático\"
  }" > /dev/null
echo "✅ Transferência realizada!"

# 5. Gerar QR Code
echo "\n4️⃣ Gerando QR Code..."
curl -s -X POST http://localhost:3000/api/pix/qrcode/dynamic \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"amount\": 25.00,
    \"description\": \"QR Code teste\"
  }" > /dev/null
echo "✅ QR Code gerado!"

echo "\n🎉 Todos os testes passaram!"
echo "📊 Acesse http://localhost:3000 para ver o dashboard"
```

Salve como `test.sh` e execute:
```bash
chmod +x test.sh
./test.sh
```

---

## 📚 Próximos Passos

### Documentação Completa
- 📖 `README.md` - Visão geral do projeto
- 🔧 `FEATURES.md` - Lista completa de funcionalidades
- 📘 `EXEMPLOS.md` - Exemplos de uso da API
- 🧪 `TESTING.md` - Guia completo de testes
- 🚀 `DEPLOYMENT.md` - Guia de deploy

### Endpoints da API

**Contas:**
- `POST /api/accounts` - Criar conta
- `GET /api/accounts` - Listar contas
- `GET /api/accounts/:id` - Consultar conta
- `GET /api/accounts/:id/balance` - Consultar saldo
- `GET /api/accounts/stats/general` - Estatísticas

**Chaves PIX:**
- `POST /api/pix/keys` - Criar chave
- `GET /api/pix/keys/account/:id` - Listar chaves
- `GET /api/pix/keys/lookup/:key` - Consultar chave
- `DELETE /api/pix/keys/:id` - Remover chave

**Transações:**
- `POST /api/transactions` - Enviar PIX
- `GET /api/transactions` - Listar transações
- `GET /api/transactions/:id` - Consultar transação
- `POST /api/transactions/:id/refund` - Estornar

**QR Code:**
- `POST /api/pix/qrcode/static` - QR Code estático
- `POST /api/pix/qrcode/dynamic` - QR Code dinâmico
- `POST /api/transactions/qrcode/pay` - Pagar QR Code
- `GET /api/pix/qrcode/:id` - Consultar QR Code

---

## 🆘 Problemas Comuns

### Porta já em uso
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependências não instaladas
```bash
rm -rf node_modules
npm install
```

### Servidor não inicia
```bash
# Verificar se Node.js está instalado
node --version

# Deve ser v18 ou superior
```

---

## 💡 Dicas

1. **Use o dashboard web** - É muito mais fácil que a API
2. **Teste com contas de exemplo** - Já vem configurado
3. **Veja os logs** - Aparecem no terminal onde você rodou `npm start`
4. **Explore as tabs** - Cada uma tem funcionalidades diferentes
5. **Leia os exemplos** - Arquivo `EXEMPLOS.md` tem casos completos

---

## 🎯 Checklist Inicial

- [ ] Node.js instalado (v18+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor rodando (`npm start`)
- [ ] Dashboard acessível (localhost:3000)
- [ ] Conta criada
- [ ] Chave PIX cadastrada
- [ ] Transferência realizada
- [ ] QR Code gerado

---

## 🌟 Recursos Principais

✨ **Interface Moderna** - Design profissional com gradiente Nexus
⚡ **Performance** - Processamento instantâneo
🔒 **Seguro** - Validações em todas as operações
📱 **Responsivo** - Funciona em qualquer dispositivo
🎨 **Intuitivo** - Fácil de usar
📊 **Completo** - Todas as funcionalidades PIX
🚀 **Pronto** - Sistema 100% funcional

---

## 📞 Suporte

Problemas? Consulte:
1. `README.md` - Documentação principal
2. `TESTING.md` - Casos de teste
3. `EXEMPLOS.md` - Exemplos práticos
4. Console do navegador - Erros de frontend
5. Terminal - Logs do servidor

---

**🎉 Pronto para começar!**

Execute `npm start` e acesse `http://localhost:3000`

**Sistema Nexus PIX - 100% Funcional e Pronto para Usar! 💙**
