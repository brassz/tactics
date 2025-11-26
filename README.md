# 🚀 NEXUS PIX - Sistema Completo de API PIX

Sistema completo e 100% funcional de API PIX desenvolvido para a Nexus. Sistema de pagamentos instantâneos moderno, intuitivo e profissional.

![Nexus Logo](https://i.ibb.co/SVGLgXj/nexus-logo.png)

## 📋 Características

### ✨ Funcionalidades Principais

- ✅ **Gerenciamento de Contas**
  - Criação de contas CPF e CNPJ
  - Consulta de saldo em tempo real
  - Visualização de detalhes completos

- 🔑 **Chaves PIX**
  - Suporte a todos os tipos: CPF, CNPJ, Email, Telefone e Aleatória
  - Cadastro e exclusão de chaves
  - Validação e verificação automática

- 💸 **Transações PIX**
  - Envio de PIX instantâneo
  - Recebimento automático
  - Estorno de transações
  - Histórico completo
  - Rastreamento por TXID

- 📱 **QR Code PIX**
  - Geração de QR Code Estático
  - Geração de QR Code Dinâmico
  - Payload PIX copia e cola
  - Expiração automática (QR dinâmico)

- 📊 **Dashboard Analytics**
  - Estatísticas em tempo real
  - Volume total de transações
  - Quantidade de contas ativas
  - Total de chaves PIX cadastradas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **UUID** - Geração de IDs únicos
- **QRCode** - Geração de QR Codes
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Estrutura
- **TailwindCSS** - Estilização moderna
- **JavaScript (Vanilla)** - Interatividade
- **Font Awesome** - Ícones

### Banco de Dados
- **In-Memory Database** - Sistema de banco de dados simulado em memória
- Persistência durante execução
- Dados de exemplo pré-carregados

## 🚀 Como Usar

### Instalação

1. **Clone ou baixe o repositório**
```bash
cd /workspace
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor**
```bash
npm start
```

4. **Acesse o sistema**
```
http://localhost:3000
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### Endpoints Disponíveis

#### 🏦 Contas

**POST /api/accounts**
Criar nova conta
```json
{
  "name": "João Silva",
  "document": "123.456.789-00",
  "documentType": "CPF",
  "balance": 1000.00
}
```

**GET /api/accounts**
Listar todas as contas

**GET /api/accounts/:accountId**
Consultar conta específica

**GET /api/accounts/:accountId/balance**
Consultar saldo

**GET /api/accounts/stats/general**
Estatísticas gerais do sistema

#### 🔑 Chaves PIX

**POST /api/pix/keys**
Criar chave PIX
```json
{
  "accountId": "uuid",
  "keyType": "CPF",
  "keyValue": "12345678900"
}
```

**GET /api/pix/keys/account/:accountId**
Listar chaves de uma conta

**GET /api/pix/keys/lookup/:keyValue**
Consultar chave PIX

**DELETE /api/pix/keys/:keyId**
Remover chave PIX

#### 💸 Transações

**POST /api/transactions**
Enviar PIX
```json
{
  "fromAccountId": "uuid",
  "pixKey": "12345678900",
  "amount": 100.00,
  "description": "Pagamento"
}
```

**GET /api/transactions**
Listar todas as transações

**GET /api/transactions/:transactionId**
Consultar transação específica

**GET /api/transactions/account/:accountId**
Listar transações de uma conta

**POST /api/transactions/:transactionId/refund**
Estornar transação
```json
{
  "reason": "Motivo do estorno"
}
```

#### 📱 QR Code

**POST /api/pix/qrcode/static**
Gerar QR Code estático
```json
{
  "accountId": "uuid",
  "pixKey": "12345678900",
  "amount": 100.00,
  "description": "Pagamento"
}
```

**POST /api/pix/qrcode/dynamic**
Gerar QR Code dinâmico
```json
{
  "accountId": "uuid",
  "amount": 100.00,
  "description": "Pagamento",
  "expiresIn": 30
}
```

**GET /api/pix/qrcode/:qrcodeId**
Consultar QR Code

**GET /api/pix/qrcode/account/:accountId**
Listar QR Codes de uma conta

**POST /api/transactions/qrcode/pay**
Pagar QR Code
```json
{
  "fromAccountId": "uuid",
  "qrCodePayload": "payload_json"
}
```

## 🎯 Funcionalidades do Sistema

### Dashboard Principal
- Visualização de estatísticas em tempo real
- Cards informativos com métricas principais
- Interface moderna e responsiva

### Gerenciamento de Contas
- Criação fácil de novas contas
- Visualização de saldo e detalhes
- Suporte para CPF e CNPJ

### Chaves PIX
- Cadastro rápido de chaves
- Suporte a todos os tipos de chave
- Validação automática
- Exclusão segura

### Transações
- Envio instantâneo de PIX
- Histórico completo
- Status em tempo real (COMPLETED, PENDING, FAILED)
- Sistema de estorno
- TXID para rastreamento

### QR Code
- Geração de QR Code estático e dinâmico
- Visualização do QR Code
- Payload copia e cola
- Controle de expiração

## 🎨 Interface do Usuário

- **Design Moderno**: Interface clean e profissional
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Intuitivo**: Navegação fácil e clara
- **Feedback Visual**: Notificações toast para todas as ações
- **Animações Suaves**: Transições e efeitos elegantes
- **Cores da Marca**: Gradiente roxo/azul representando a Nexus

## 🔒 Segurança

- Validação de dados em todas as operações
- Verificação de saldo antes de transações
- Prevenção de transferências para a mesma conta
- Sistema de status para rastreamento
- Logs de todas as operações

## 📊 Dados de Exemplo

O sistema vem pré-carregado com dados de exemplo:

### Contas
- **João Silva** (CPF) - Saldo: R$ 5.000,00
- **Maria Santos** (CPF) - Saldo: R$ 3.500,00
- **Nexus Pagamentos LTDA** (CNPJ) - Saldo: R$ 150.000,00

### Chaves PIX
- CPF: 12345678900
- Email: joao@example.com
- Telefone: +5511987654321
- CNPJ: 12345678000190

## 🎓 Casos de Uso

1. **Loja Virtual**
   - Gerar QR Code para pagamento
   - Cliente escaneia e paga
   - Confirmação instantânea

2. **Transferência entre Amigos**
   - Buscar chave PIX do destinatário
   - Enviar valor
   - Recebimento imediato

3. **Pagamento de Serviços**
   - Gerar QR Code dinâmico
   - Cliente paga até expiração
   - Confirmação automática

4. **Sistema de Estorno**
   - Identificar transação
   - Solicitar estorno com motivo
   - Reversão automática

## 💡 Diferencial

Este sistema PIX foi desenvolvido para ser:

- ✅ **100% Funcional** - Todas as operações funcionam completamente
- ✅ **Independente** - Não requer conexão com Banco Central ou BACEN
- ✅ **Completo** - Implementa todas as funcionalidades PIX
- ✅ **Moderno** - Interface atual e profissional
- ✅ **Intuitivo** - Fácil de usar e entender
- ✅ **Escalável** - Estrutura pronta para crescer

## 🚀 Deploy

### Vercel
```bash
vercel
```

### Heroku
```bash
heroku create nexus-pix
git push heroku main
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notas Importantes

- Este é um sistema de demonstração/simulação
- Não está conectado ao sistema PIX real do Banco Central
- Perfeito para testes, desenvolvimento e demonstrações
- Todos os dados são armazenados em memória (resetam ao reiniciar)

## 🤝 Suporte

Para dúvidas ou problemas:
- Consulte a documentação da API
- Verifique os logs do console
- Teste os endpoints individualmente

## 📄 Licença

MIT License - Livre para uso e modificação

---

**Desenvolvido com ❤️ para Nexus**

Sistema PIX Completo e Funcional - 2024
