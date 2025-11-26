# 💳 GUIA: Como Adicionar Suas Contas REAIS

## 🎯 Sistema Agora com Persistência de Dados

O sistema foi atualizado para **salvar todos os dados** em um arquivo. Agora você pode:

✅ Adicionar suas contas reais
✅ Dados são mantidos mesmo depois de reiniciar
✅ Todas as transações ficam salvas
✅ Chaves PIX funcionam corretamente

---

## 📝 PASSO A PASSO: Adicionar Sua Conta Real

### 1️⃣ Iniciar o Sistema

```bash
cd /workspace
npm start
```

### 2️⃣ Criar Sua Conta Real

1. Abra `http://localhost:3000`
2. Clique em **"Nova Conta"**
3. Preencha com SEUS dados reais:

**Exemplo Pessoa Física:**
```
Nome: João Carlos Silva
Tipo: CPF
Documento: 123.456.789-00 (SEU CPF real)
Saldo Inicial: 1500.00 (quanto você tem/quer simular)
```

**Exemplo Pessoa Jurídica:**
```
Nome: Minha Empresa LTDA
Tipo: CNPJ
Documento: 12.345.678/0001-90 (SEU CNPJ real)
Saldo Inicial: 50000.00
```

4. Clique em **"Criar Conta"**

✅ **Conta criada e SALVA permanentemente!**

---

### 3️⃣ Cadastrar Suas Chaves PIX Reais

1. Vá na tab **"Chaves PIX"**
2. Clique em **"Nova Chave PIX"**
3. Selecione sua conta
4. Escolha o tipo de chave e digite:

**Suas opções de chave PIX:**

#### Chave CPF:
```
Tipo: CPF
Valor: 12345678900 (seu CPF sem pontos/traços)
```

#### Chave CNPJ:
```
Tipo: CNPJ
Valor: 12345678000190 (seu CNPJ sem pontos/traços)
```

#### Chave Email:
```
Tipo: EMAIL
Valor: seu.email@real.com (seu email verdadeiro)
```

#### Chave Telefone:
```
Tipo: PHONE
Valor: +5511999887766 (seu telefone com código do país)
```

#### Chave Aleatória:
```
Tipo: RANDOM
Valor: 123e4567-e89b-12d3-a456-426614174000
```

5. Clique em **"Criar Chave"**

✅ **Chave PIX cadastrada e SALVA!**

---

## 🔄 USAR COM CONTAS REAIS

Agora você pode usar o sistema com suas contas reais dentro da plataforma:

### Exemplo 1: Você e um Amigo

**Você:**
- Nome: João Silva
- CPF: 123.456.789-00
- Chave PIX: joao.silva@email.com
- Saldo: R$ 2.000

**Seu Amigo:**
- Nome: Maria Costa
- CPF: 987.654.321-00
- Chave PIX: maria.costa@email.com
- Saldo: R$ 1.500

**Fazer Transferência:**
1. Você envia R$ 100 para maria.costa@email.com
2. Maria recebe R$ 100 automaticamente
3. Saldos atualizados:
   - Você: R$ 1.900
   - Maria: R$ 1.600

---

## 💾 ONDE OS DADOS SÃO SALVOS?

Os dados ficam salvos em:
```
/workspace/api/database/data.json
```

### Ver seus dados salvos:

```bash
cat /workspace/api/database/data.json
```

### Backup dos seus dados:

```bash
cp /workspace/api/database/data.json ~/backup_pix.json
```

### Restaurar backup:

```bash
cp ~/backup_pix.json /workspace/api/database/data.json
```

---

## 🔍 RESOLVER: "Chave PIX não encontrada"

### Causa do erro:
A chave PIX que você digitou não existe no sistema.

### Solução:

1. **Verificar se a chave está cadastrada:**
   - Vá na tab "Chaves PIX"
   - Veja quais chaves existem
   - Use uma chave que esteja na lista

2. **Cadastrar a chave antes de usar:**
   - Primeiro cadastre a chave PIX
   - Depois use ela para receber

3. **Copiar a chave exatamente:**
   - Chaves são case-sensitive
   - Não pode ter espaços
   - Email: `joao@email.com` ✅
   - Email: `Joao@Email.com` ❌ (diferente)

---

## 📱 EXEMPLO COMPLETO: Simular Sua Vida Real

### Cenário: Você tem 3 contas

**Conta 1 - Pessoal:**
```
Nome: Seu Nome
CPF: Seu CPF
Saldo: R$ 3.000
Chave: seu.email@gmail.com
```

**Conta 2 - Empresa:**
```
Nome: Sua Empresa LTDA
CNPJ: Seu CNPJ
Saldo: R$ 50.000
Chave: contato@suaempresa.com
```

**Conta 3 - Freelancer:**
```
Nome: Seu Nome - MEI
CPF: Seu CPF
Saldo: R$ 10.000
Chave: +5511999887766
```

### Operações do dia a dia:

1. **Cliente paga serviço:**
   - Cliente → Sua chave freelancer
   - R$ 500

2. **Você paga conta pessoal:**
   - Conta pessoal → Chave do fornecedor
   - R$ 150

3. **Transferir entre suas contas:**
   - Conta freelancer → Conta pessoal
   - R$ 1.000

Tudo salvo e rastreável! 📊

---

## 🏢 PARA EMPRESAS

Se você tem uma empresa, pode simular:

### Conta Principal:
```
Nome: Nexus Tecnologia LTDA
CNPJ: 12.345.678/0001-90
Saldo: R$ 100.000
Chaves:
  - financeiro@nexus.com
  - 12345678000190
  - +551133334444
```

### Contas de Clientes:
Crie contas para simular clientes pagando:
```
Cliente 1: R$ 500 → financeiro@nexus.com
Cliente 2: R$ 1.200 → financeiro@nexus.com
Cliente 3: R$ 800 → financeiro@nexus.com
```

### Resultado:
- Todas as vendas registradas
- Histórico completo
- Saldo atualizado em tempo real

---

## 🔒 SEGURANÇA E PRIVACIDADE

⚠️ **IMPORTANTE:**

Este é um sistema de **SIMULAÇÃO LOCAL**. 

✅ **Seguro:**
- Dados ficam apenas no seu computador
- Não conecta com banco real
- Não acessa suas contas bancárias
- Não faz transações reais

❌ **NÃO faz:**
- Não envia dinheiro real
- Não acessa Banco Central
- Não conecta com bancos
- Não usa internet para PIX real

💡 **Perfeito para:**
- Testar fluxos de pagamento
- Treinar equipe
- Demonstrações
- Desenvolvimento de sistemas
- Simular cenários

---

## 📊 ADICIONAR MÚLTIPLAS CONTAS

### Script para adicionar várias contas via API:

```bash
# Conta 1
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "document": "123.456.789-00",
    "documentType": "CPF",
    "balance": 2000
  }'

# Conta 2
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Costa",
    "document": "987.654.321-00",
    "documentType": "CPF",
    "balance": 1500
  }'

# Conta 3
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions LTDA",
    "document": "12.345.678/0001-90",
    "documentType": "CNPJ",
    "balance": 50000
  }'
```

---

## 🎯 DICAS IMPORTANTES

### ✅ FAZER:
- Use dados reais (seus documentos verdadeiros)
- Cadastre todas suas chaves PIX
- Simule transações do dia a dia
- Faça backup do arquivo data.json
- Teste todos os cenários

### ❌ NÃO FAZER:
- Não compartilhe senhas reais (sistema não pede)
- Não digite dados bancários reais
- Não confunda com sistema bancário real
- Não espere dinheiro real sair/entrar

---

## 🔄 RESETAR SISTEMA

Se quiser começar do zero:

```bash
# Parar servidor
# Deletar dados
rm /workspace/api/database/data.json

# Reiniciar servidor
npm start
```

O sistema criará novos dados de exemplo.

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

Após adicionar suas contas reais, verifique:

- [ ] Conta criada com seus dados
- [ ] Chave PIX cadastrada
- [ ] Consegue enviar PIX
- [ ] Consegue receber PIX
- [ ] Saldo atualiza corretamente
- [ ] Transações aparecem no histórico
- [ ] Dados salvos (fechar e abrir mantém)
- [ ] QR Code funciona
- [ ] Estorno funciona

---

## 🎉 PRONTO!

Agora você tem um **sistema PIX totalmente funcional** com suas contas reais!

**Recursos:**
- ✅ Persistência de dados
- ✅ Múltiplas contas
- ✅ Chaves PIX reais
- ✅ Transações salvas
- ✅ Histórico completo
- ✅ 100% funcional

**Use para:**
- Simular seu dia a dia
- Testar cenários
- Treinar equipe
- Demonstrações de produto
- Desenvolvimento de integrações

---

**Dúvidas? Consulte:**
- `COMO_USAR.md` - Guia de uso
- `README.md` - Documentação completa
- `EXEMPLOS.md` - Exemplos práticos
