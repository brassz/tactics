# ⚡ Guia Rápido - Gerar APK

## 🎯 Passos Rápidos

### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login no Expo
```bash
eas login
```

### 3. Inicializar Projeto (primeira vez apenas)
```bash
cd mobile
eas init
```

### 4. Gerar APK
```bash
eas build --platform android --profile production
```

### 5. Aguardar e Baixar
- Aguarde 10-30 minutos
- Receba o link por email ou no terminal
- Baixe o APK

## 📱 Distribuir

1. Faça upload do APK para Google Drive/Dropbox
2. Compartilhe o link com seus clientes
3. Eles precisam habilitar "Instalar apps desconhecidos" no Android

## ⚙️ Atualizar Versão

Edite `app.json`:
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

Depois execute novamente o comando de build.

## 📖 Guia Completo

Veja `BUILD_APK.md` para mais detalhes.

