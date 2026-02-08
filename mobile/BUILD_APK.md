# 📱 Guia para Gerar APK do App

Este guia explica como gerar um arquivo APK para distribuir o app aos seus clientes.

## 📋 Pré-requisitos

1. **Conta Expo**: Crie uma conta gratuita em [expo.dev](https://expo.dev)
2. **Node.js**: Versão 18 ou superior
3. **EAS CLI**: Ferramenta para fazer builds

## 🚀 Passo a Passo

### 1. Instalar EAS CLI

```bash
cd mobile
npm install -g eas-cli
```

### 2. Fazer Login no Expo

```bash
eas login
```

Digite seu email e senha da conta Expo.

### 3. Configurar o Projeto

```bash
eas build:configure
```

Isso criará o arquivo `eas.json` (já criado) e configurará o projeto.

### 4. Criar o Projeto no Expo (se ainda não tiver)

```bash
eas init
```

Siga as instruções na tela. Isso criará um projeto no Expo e adicionará o `projectId` ao `app.json`.

### 5. Gerar o APK

#### Opção A: Build de Produção (Recomendado)

```bash
eas build --platform android --profile production
```

#### Opção B: Build de Preview (Mais rápido, para testes)

```bash
eas build --platform android --profile preview
```

### 6. Aguardar o Build

O build será processado na nuvem do Expo. Você receberá:
- Um link para acompanhar o progresso
- Uma notificação quando o build estiver pronto
- Um link para download do APK

### 7. Baixar o APK

Quando o build estiver pronto:
1. Acesse o link fornecido ou vá em [expo.dev](https://expo.dev)
2. Vá em "Builds" no menu
3. Clique no build mais recente
4. Baixe o arquivo APK

## 📦 Distribuir o APK

### Opção 1: Download Direto

1. Faça upload do APK para um servidor (Google Drive, Dropbox, etc.)
2. Compartilhe o link com seus clientes
3. Eles precisam habilitar "Instalar apps de fontes desconhecidas" no Android

### Opção 2: Google Play Store (Recomendado para distribuição ampla)

Para publicar na Play Store, você precisará:
1. Criar uma conta de desenvolvedor Google Play (taxa única de $25)
2. Gerar um AAB (Android App Bundle) em vez de APK:
   ```bash
   eas build --platform android --profile production --type app-bundle
   ```
3. Fazer upload do AAB na Play Console

## 🔧 Configurações Avançadas

### Atualizar Versão do App

Edite `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

- `version`: Versão visível para o usuário (ex: "1.0.1")
- `versionCode`: Número interno que deve aumentar a cada build

### Adicionar Ícone e Splash Screen

Certifique-se de que os arquivos existem:
- `assets/icon.png` (1024x1024px)
- `assets/adaptive-icon.png` (1024x1024px)
- `assets/splash.png` (1284x2778px recomendado)

### Assinatura do App (Opcional)

Para builds de produção, o Expo gera automaticamente uma assinatura. Se quiser usar sua própria:

```bash
eas credentials
```

## 🐛 Troubleshooting

### Erro: "Project not found"

Execute:
```bash
eas init
```

### Erro: "Not logged in"

Execute:
```bash
eas login
```

### Build falha

1. Verifique os logs no link fornecido
2. Certifique-se de que todas as dependências estão instaladas:
   ```bash
   npm install
   ```
3. Verifique se o `app.json` está válido

### APK não instala no dispositivo

1. Certifique-se de que o dispositivo permite instalação de apps desconhecidos
2. Verifique se o APK não está corrompido (baixe novamente)
3. Tente em outro dispositivo

## 📝 Comandos Úteis

```bash
# Ver builds anteriores
eas build:list

# Ver detalhes de um build
eas build:view [BUILD_ID]

# Cancelar um build em andamento
eas build:cancel [BUILD_ID]

# Ver status do build
eas build:status
```

## 💡 Dicas

1. **Primeira vez**: O primeiro build pode demorar mais (15-30 minutos)
2. **Builds subsequentes**: Geralmente são mais rápidos (5-15 minutos)
3. **Teste antes**: Sempre teste o APK em um dispositivo antes de distribuir
4. **Versões**: Incremente o `versionCode` a cada novo build
5. **Notificações**: Configure notificações por email no Expo para saber quando o build estiver pronto

## 🔐 Segurança

- **Nunca** compartilhe suas credenciais do Expo
- Mantenha o `projectId` no `app.json` (não é sensível)
- Para produção, considere usar assinatura própria

## 📞 Suporte

Se tiver problemas:
1. Verifique a [documentação do EAS](https://docs.expo.dev/build/introduction/)
2. Consulte os logs do build no dashboard do Expo
3. Verifique o status do serviço em [status.expo.dev](https://status.expo.dev)

