# Pasta de Imagens - App Mobile

Esta pasta contém as imagens e logos utilizadas no aplicativo mobile React Native.

## Como usar

### Logo da Empresa

Coloque a logo da empresa nesta pasta. Formatos aceitos:
- `logo.jpg` ou `logo.jpeg` - Logo principal em alta resolução
- `logo.png` - Logo com transparência (opcional)
- `logo@2x.jpg` - Logo em resolução 2x (opcional)
- `logo@3x.jpg` - Logo em resolução 3x (opcional)

**Nota:** Para React Native, JPEG funciona perfeitamente. Use PNG apenas se precisar de transparência.

### Importando no React Native

```javascript
// Em qualquer componente
import { Image } from 'react-native';

export default function Header() {
  return (
    <Image 
      source={require('../assets/images/logo.jpg')} 
      style={{ width: 150, height: 50 }}
      resizeMode="contain"
    />
  );
}
```

### Usando com expo-image (recomendado)

```javascript
import { Image } from 'expo-image';

export default function Header() {
  return (
    <Image 
      source={require('../assets/images/logo.jpg')} 
      style={{ width: 150, height: 50 }}
      contentFit="contain"
    />
  );
}
```

### Tamanhos Recomendados

Para React Native, use imagens em alta resolução:
- **@1x**: tamanho base (ex: 150x50px)
- **@2x**: 2x o tamanho base (ex: 300x100px)
- **@3x**: 3x o tamanho base (ex: 450x150px)

O React Native automaticamente escolherá a melhor resolução baseada no device.

## Estrutura

```
images/
  ├── logo.jpg          # Logo principal (JPEG)
  ├── logo.png          # Logo com transparência (opcional)
  ├── logo@2x.jpg       # Logo @2x (opcional)
  ├── logo@3x.jpg       # Logo @3x (opcional)
  └── README.md         # Este arquivo
```

## Ícone do App

Para o ícone do aplicativo, edite o arquivo `app.json` na raiz do projeto mobile:

```json
{
  "expo": {
    "icon": "./assets/images/app-icon.png"
  }
}
```

Tamanho recomendado para o ícone: **1024x1024px**

