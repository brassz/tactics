# 🎨 Assets Necessários para o Build

Para gerar o APK, você precisa dos seguintes arquivos de imagem:

## 📋 Arquivos Necessários

Coloque estes arquivos na pasta `mobile/assets/`:

### 1. `icon.png`
- **Tamanho**: 1024x1024 pixels
- **Formato**: PNG
- **Uso**: Ícone principal do app
- **Localização**: `mobile/assets/icon.png`

### 2. `adaptive-icon.png`
- **Tamanho**: 1024x1024 pixels
- **Formato**: PNG
- **Uso**: Ícone adaptativo para Android (aparece em diferentes formas)
- **Localização**: `mobile/assets/adaptive-icon.png`

### 3. `splash.png`
- **Tamanho**: Recomendado 1284x2778 pixels (ou proporção similar)
- **Formato**: PNG
- **Uso**: Tela de splash (tela inicial ao abrir o app)
- **Localização**: `mobile/assets/splash.png`

### 4. `favicon.png` (opcional, para web)
- **Tamanho**: 48x48 ou 96x96 pixels
- **Formato**: PNG
- **Localização**: `mobile/assets/favicon.png`

## 🛠️ Como Criar os Assets

### Opção 1: Usar Ferramentas Online

1. **Para ícones**: Use [AppIcon.co](https://www.appicon.co/) ou [IconKitchen](https://icon.kitchen/)
2. **Para splash**: Use [Splash Screen Generator](https://www.figma.com/community/plugin/972939895153434316/expo-splash-screen-generator)

### Opção 2: Criar Manualmente

Use ferramentas como:
- **Figma** (gratuito)
- **Photoshop**
- **GIMP** (gratuito)
- **Canva** (gratuito)

### Opção 3: Usar o Logo Existente

Se você já tem um logo em `assets/images/logo.png`, você pode:

1. Redimensionar para 1024x1024px
2. Salvar como `icon.png` e `adaptive-icon.png`
3. Criar uma tela de splash com o logo centralizado

## 📝 Checklist Antes do Build

- [ ] `icon.png` existe e tem 1024x1024px
- [ ] `adaptive-icon.png` existe e tem 1024x1024px
- [ ] `splash.png` existe
- [ ] Todos os arquivos estão em `mobile/assets/`

## ⚠️ Importante

**Sem estes arquivos, o build pode falhar!**

Se você não tiver os assets prontos, você pode:
1. Criar assets temporários simples (quadrados coloridos)
2. Fazer o build de teste
3. Depois substituir pelos assets finais

## 🔄 Atualizar Assets Após o Build

Se você atualizar os assets depois:
1. Substitua os arquivos em `mobile/assets/`
2. Execute o build novamente
3. Incremente o `versionCode` no `app.json`

