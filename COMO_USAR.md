# 💰 COMO USAR O SISTEMA PIX - Guia Completo

## 🚀 INICIAR O SISTEMA

### 1. Abra o terminal e execute:

```bash
cd /workspace
npm start
```

O sistema vai iniciar em `http://localhost:3000`

---

## 👤 CRIAR SUA CONTA

### Passo 1: Clicar em "Nova Conta"

1. No dashboard, clique no botão **"Nova Conta"**
2. Preencha o formulário:
   - **Nome Completo**: Digite seu nome (ex: "Maria Silva")
   - **Tipo de Documento**: Escolha CPF ou CNPJ
   - **Número do Documento**: Digite o CPF/CNPJ (pode ser fictício, ex: "111.222.333-44")
   - **Saldo Inicial**: Digite quanto quer começar (ex: 1000)
3. Clique em **"Criar Conta"**

✅ **Pronto!** Sua conta foi criada e aparece na lista!

---

## 🔑 CADASTRAR CHAVE PIX

### Passo 1: Ir para aba "Chaves PIX"

1. Clique na tab **"Chaves PIX"** no topo
2. Clique no botão **"Nova Chave PIX"**
3. Preencha:
   - **Conta**: Selecione sua conta
   - **Tipo de Chave**: Escolha (CPF, Email, Telefone, etc)
   - **Valor da Chave**: Digite a chave
     - Se CPF: digite só números (ex: "11122233344")
     - Se Email: digite um email (ex: "maria@email.com")
     - Se Telefone: digite com código (ex: "+5511999887766")
4. Clique em **"Criar Chave"**

✅ **Sua chave PIX está ativa!**

---

## 💸 FAZER UM PIX (ENVIAR)

### Passo 1: Ir para aba "Transações"

1. Clique na tab **"Transações"**
2. Clique no botão **"Enviar PIX"**
3. Preencha o formulário:
   - **Conta de Origem**: Selecione sua conta
   - **Chave PIX de Destino**: Digite a chave de quem vai receber
     - Pode usar uma das chaves de exemplo: **12345678900**
   - **Valor**: Digite quanto quer enviar (ex: 50.00)
   - **Descrição**: Digite o motivo (ex: "Pagamento")
4. Clique em **"Enviar PIX"**

✅ **PIX enviado com sucesso!** O dinheiro sai da sua conta e vai para a conta do destinatário.

---

## 📱 RECEBER PIX

### Opção 1: Alguém envia para sua chave

Quando alguém faz um PIX para sua chave PIX, o dinheiro **entra automaticamente** na sua conta!

### Opção 2: Gerar QR Code para receber

1. Vá para a tab **"QR Code"**
2. Preencha:
   - **Tipo**: Escolha "Dinâmico"
   - **Conta**: Selecione sua conta
   - **Valor**: Digite quanto quer receber (ex: 100.00)
   - **Descrição**: Digite o motivo (ex: "Venda de produto")
3. Clique em **"Gerar QR Code"**

✅ **QR Code gerado!** Agora você pode:
- Mostrar o QR Code para alguém escanear
- Ou copiar o "Payload PIX" e enviar

---

## 🔍 VER SUAS TRANSAÇÕES

1. Vá para a tab **"Transações"**
2. Você verá todas as suas transações:
   - 🟢 Verde = Concluída
   - 🟡 Amarelo = Pendente
   - 🔴 Vermelho = Falhou
3. Cada transação mostra:
   - De quem → Para quem
   - Valor
   - Data/hora
   - TXID (código da transação)

---

## 💰 VERIFICAR SEU SALDO

### Opção 1: No dashboard principal

1. Volte para a tab **"Contas"**
2. Seu saldo aparece no card da sua conta em verde

### Opção 2: Ver detalhes

1. Clique em **"Ver Detalhes"** na sua conta
2. Aparece uma janela com:
   - Nome
   - CPF/CNPJ
   - Saldo atual
   - Chaves PIX cadastradas

---

## 🔄 ESTORNAR UM PIX

Se você enviou um PIX por engano:

1. Vá para tab **"Transações"**
2. Encontre a transação que quer estornar
3. Clique no botão **"Estornar"** (aparece só em transações concluídas)
4. Digite o motivo do estorno
5. Clique OK

✅ **Estorno realizado!** O dinheiro volta para sua conta.

---

## 📊 CENÁRIO COMPLETO DE TESTE

### Teste 1: Criar duas contas e fazer PIX entre elas

**Passo a Passo:**

1. **Criar Conta 1** (Você)
   - Nome: "João Silva"
   - CPF: "111.222.333-44"
   - Saldo: 1000

2. **Criar Chave PIX para Conta 1**
   - Tipo: EMAIL
   - Valor: "joao@teste.com"

3. **Criar Conta 2** (Amigo)
   - Nome: "Maria Costa"
   - CPF: "555.666.777-88"
   - Saldo: 500

4. **Criar Chave PIX para Conta 2**
   - Tipo: CPF
   - Valor: "55566677788"

5. **Enviar PIX da Conta 1 para Conta 2**
   - Origem: João Silva
   - Destino: 55566677788
   - Valor: 100
   - Descrição: "Transferência teste"

6. **Verificar**
   - Conta João: Saldo agora é 900 (1000 - 100)
   - Conta Maria: Saldo agora é 600 (500 + 100)

---

## 🎯 DICAS IMPORTANTES

### ✅ Para ENVIAR PIX você precisa:
- Ter uma conta criada
- Ter saldo suficiente
- Saber a chave PIX do destinatário

### ✅ Para RECEBER PIX você precisa:
- Ter uma conta criada
- Ter uma chave PIX cadastrada
- Informar sua chave para quem vai pagar

### ⚠️ Atenção:
- Não pode enviar PIX para você mesmo
- O valor tem que ser maior que zero
- Só pode estornar transações concluídas
- As chaves PIX são únicas (não pode repetir)

---

## 🔑 CHAVES PIX DE EXEMPLO (Pré-cadastradas)

Use estas chaves para fazer testes:

- **CPF**: `12345678900` (João Silva - R$ 5.000)
- **Email**: `joao@example.com` (João Silva)
- **Telefone**: `+5511987654321` (Maria Santos - R$ 3.500)
- **CNPJ**: `12345678000190` (Nexus Pagamentos - R$ 150.000)

---

## 💡 EXEMPLO PRÁTICO RÁPIDO

### Quero enviar R$ 50 para um amigo:

```
1. ✅ Já tenho conta? 
   SIM → Passo 2
   NÃO → Criar conta primeiro

2. ✅ Meu amigo tem chave PIX?
   SIM → Anotar a chave dele
   NÃO → Ele precisa criar

3. 📱 Ir em "Transações" → "Enviar PIX"

4. 📝 Preencher:
   - Minha conta
   - Chave PIX do amigo
   - R$ 50,00
   - "Presente"

5. 🚀 Clicar "Enviar PIX"

6. ✅ PRONTO! PIX enviado em segundos!
```

---

## 📱 EXEMPLO: GERAR QR CODE PARA RECEBER

### Quero receber R$ 100 de um cliente:

```
1. ✅ Ir na tab "QR Code"

2. 📝 Preencher:
   - Tipo: Dinâmico
   - Minha conta
   - R$ 100,00
   - "Venda de produto X"

3. 🚀 Clicar "Gerar QR Code"

4. 📱 QR Code aparece na tela

5. 👉 Cliente escaneia o QR Code

6. ✅ Recebo o pagamento automaticamente!
```

---

## 🆘 PROBLEMAS COMUNS

### "Chave PIX não encontrada"
→ Verifique se digitou a chave correta
→ A chave precisa estar cadastrada no sistema

### "Saldo insuficiente"
→ Você não tem dinheiro suficiente na conta
→ Verifique seu saldo em "Contas"

### "Não é possível transferir para a mesma conta"
→ Você está tentando enviar PIX para você mesmo
→ Use uma conta diferente como destino

### "Chave PIX já cadastrada"
→ Esta chave já está sendo usada por outra conta
→ Use uma chave diferente

---

## 📊 ENTENDENDO O DASHBOARD

### Cards de Estatísticas (topo):

1. **Total de Contas**: Quantas contas existem no sistema
2. **Chaves PIX**: Quantas chaves estão ativas
3. **Transações**: Número total de PIX enviados
4. **Volume Total**: Soma de todo dinheiro transferido

### Tabs (navegação):

1. **Contas**: Ver e criar contas
2. **Chaves PIX**: Gerenciar chaves PIX
3. **Transações**: Ver histórico e enviar PIX
4. **QR Code**: Gerar QR Codes

---

## 🎉 RESUMO: FLUXO COMPLETO

```
1️⃣ CRIAR CONTA
   ↓
2️⃣ CADASTRAR CHAVE PIX
   ↓
3️⃣ FAZER/RECEBER PIX
   ↓
4️⃣ VER TRANSAÇÕES
   ↓
5️⃣ ESTORNAR SE NECESSÁRIO
```

---

## ✨ PRONTO PARA USAR!

**Agora você sabe tudo para usar o sistema PIX!**

- ✅ Criar conta
- ✅ Cadastrar chave PIX
- ✅ Enviar PIX
- ✅ Receber PIX
- ✅ Gerar QR Code
- ✅ Ver transações
- ✅ Estornar PIX

**Sistema 100% funcional e pronto para uso! 🚀**

---

**Dúvidas?**
- Leia o `README.md` para mais detalhes
- Veja `EXEMPLOS.md` para casos de uso avançados
- Consulte `TESTING.md` para testar todas as funcionalidades
