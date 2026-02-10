# NovixCred - Mobile App

App mobile para clientes da NovixCred.

## 🚀 Instalação

```bash
npm install
```

## 📱 Executar

```bash
# Iniciar Expo
npm start

# Abrir no Android
npm run android

# Abrir no iOS
npm run ios

# Abrir no navegador
npm run web
```

## 📸 Funcionalidades

### Cadastro e Login
- Cadastro com CPF e Nome Completo
- Login apenas com CPF (após aprovação)
- Status de aprovação em tempo real

### Upload de Documentos
- 📸 Selfie (câmera)
- 🪪 RG ou CNH
- 🏡 Comprovante de endereço
- 💰 Comprovante de renda
- 📘 Carteira de trabalho digital (PDF)

### Solicitações
- Solicitar valores
- Adicionar justificativa
- Acompanhar status
- Histórico completo

### Pagamentos
- Visualizar parcelas
- Status de pagamentos
- Datas de vencimento
- Resumo financeiro

### Chat
- Chat ao vivo com suporte
- Mensagens em tempo real
- Interface intuitiva

## 🔧 Configuração

Crie um arquivo `.env` com:

```
EXPO_PUBLIC_SUPABASE_URL=sua-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

## 📦 Dependências Principais

- React Native / Expo
- React Navigation
- Supabase JS
- Expo Camera
- Expo Document Picker
- Lucide React Native (ícones)
