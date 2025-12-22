# ✅ CORREÇÃO - Erro do expo-camera

## ❌ Erro Encontrado

```
TypeError: Cannot read property 'Type' of undefined
```

## 🔍 Causa

A versão mais recente do `expo-camera` (~17.x) mudou a API. 

**Antes (versão antiga):**
```javascript
import { Camera } from 'expo-camera';

<Camera type={Camera.Constants.Type.front} />
```

**Agora (versão nova):**
```javascript
import { Camera, CameraType } from 'expo-camera';

<Camera facing="front" />
```

## ✅ Correção Aplicada

O arquivo `mobile/components/FacialCaptureModal.js` foi corrigido:

### Mudança 1: Import
```javascript
// ANTES:
import { Camera } from 'expo-camera';

// DEPOIS:
import { Camera, CameraType } from 'expo-camera';
```

### Mudança 2: Uso da Camera
```javascript
// ANTES:
<Camera
  ref={cameraRef}
  style={styles.camera}
  type={Camera.Constants.Type.front}
>

// DEPOIS:
<Camera
  ref={cameraRef}
  style={styles.camera}
  facing="front"
>
```

## 🚀 Como Aplicar

A correção já foi aplicada automaticamente! 

**Se o erro persistir:**

1. Pare o servidor Expo (Ctrl+C)
2. Limpe o cache:
   ```bash
   cd mobile
   npx expo start --clear
   ```
3. Execute novamente:
   ```bash
   npm start
   ```

## 🧪 Testar Novamente

1. Abra o app
2. Faça login
3. Vá para "Solicitar"
4. Tente fazer uma solicitação
5. A câmera deve abrir corretamente agora! ✅

## 📋 Versões Compatíveis

- `expo-camera`: ~17.0.9 ✅
- React Native: 0.81.5 ✅
- Expo: ~54.0.0 ✅

## ⚠️ Se Ainda Houver Erros

### Erro: "Camera.requestCameraPermissionsAsync is not a function"

**Solução:** A API de permissões também mudou:

```javascript
// ANTES:
const { status } = await Camera.requestPermissionsAsync();

// DEPOIS:
const { status } = await Camera.requestCameraPermissionsAsync();
```

(Já está correto no código!)

### Erro: "takePictureAsync is not a function"

**Solução:** Certifique-se de que a ref está correta:

```javascript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.7,
  base64: false,
});
```

(Já está correto no código!)

## 📚 Referência

Documentação oficial do expo-camera v17:
https://docs.expo.dev/versions/latest/sdk/camera/

---

**Status:** ✅ CORRIGIDO!
**Data:** 22 de Dezembro de 2025

