# ✅ CORREÇÃO - API Depreciada do expo-file-system

## ❌ Erro Encontrado

```
Error: Method readAsStringAsync imported from "expo-file-system" is deprecated.
You can migrate to the new filesystem API using "File" and "Directory" classes 
or import the legacy API from "expo-file-system/legacy".
```

## 🔍 Causa

A partir do **Expo SDK 54**, o `expo-file-system` introduziu uma nova API e moveu a API antiga para `/legacy`.

**API Antiga (depreciada):**
```javascript
import * as FileSystem from 'expo-file-system';

const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: 'base64'
});
```

**API Legacy (compatível):**
```javascript
import * as FileSystem from 'expo-file-system/legacy';

const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: 'base64'
});
```

**API Nova (recomendada para novos projetos):**
```javascript
import { File } from 'expo-file-system';

const file = new File(uri);
const blob = await file.arrayBuffer();
```

## ✅ Correção Aplicada (Solução Rápida)

Usamos a **API Legacy** porque:
- ✅ Mudança mínima no código
- ✅ Funciona imediatamente
- ✅ Mantém compatibilidade
- ✅ Não requer refatoração completa

### Mudança nos Imports

**RequestScreen.js:**
```javascript
// ANTES:
import * as FileSystem from 'expo-file-system';

// DEPOIS:
import * as FileSystem from 'expo-file-system/legacy';
```

**PaymentsScreen.js:**
```javascript
// ANTES:
import * as FileSystem from 'expo-file-system';

// DEPOIS:
import * as FileSystem from 'expo-file-system/legacy';
```

## 📋 Arquivos Corrigidos

- [x] `mobile/screens/RequestScreen.js`
- [x] `mobile/screens/PaymentsScreen.js`

## 🚀 Testar Agora

1. **Recarregue o app:**
   - Pressione 'r' no terminal do Expo
   - Ou feche e abra o app novamente

2. **Teste solicitação:**
   - Login → Solicitar → Valor → Enviar
   - Tirar foto → Confirmar
   - ✅ Deve funcionar sem erros!

3. **Teste pagamento:**
   - Pagamentos → Pagar Agora
   - Tirar foto → Confirmar
   - ✅ Deve funcionar sem erros!

## 🎯 Código Final que Funciona

```javascript
// Import correto
import * as FileSystem from 'expo-file-system/legacy';

// Função de upload
const uploadFacialImage = async (imageUri) => {
  // Ler como base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  // Converter para Uint8Array
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Upload para Supabase
  const { data, error } = await supabase.storage
    .from('user-documents')
    .upload(filePath, byteArray, {
      contentType: 'image/jpeg',
    });

  // Retornar URL pública
  const { data: urlData } = supabase.storage
    .from('user-documents')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
```

## 🔮 Migração Futura (Opcional)

Se quiser usar a **nova API** no futuro:

```javascript
import { File } from 'expo-file-system';

const uploadFacialImage = async (imageUri) => {
  // Nova API
  const file = new File(imageUri);
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Upload
  const { data, error } = await supabase.storage
    .from('user-documents')
    .upload(filePath, uint8Array, {
      contentType: 'image/jpeg',
    });

  // ...resto do código
};
```

Mas por enquanto, a API Legacy funciona perfeitamente! ✅

## 📚 Documentação Oficial

**expo-file-system v54:**
https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/

**Guia de Migração:**
https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/#migration

## ⚠️ Avisos

### API Legacy está OK para usar
A equipe do Expo mantém a API legacy para compatibilidade. Não há pressa para migrar.

### Quando Migrar?
- Quando a API legacy for **removida** (não apenas depreciada)
- Quando iniciar um **novo projeto**
- Quando tiver **tempo** para refatorar

### Por Enquanto
✅ **Use `/legacy` e fique tranquilo!**

## 🎓 Resumo das Mudanças de API

### Expo SDK 53 e anteriores:
```javascript
import * as FileSystem from 'expo-file-system';
FileSystem.readAsStringAsync() // ✅ Funciona
```

### Expo SDK 54+:
```javascript
// Opção 1: Legacy (recomendado para apps existentes)
import * as FileSystem from 'expo-file-system/legacy';
FileSystem.readAsStringAsync() // ✅ Funciona

// Opção 2: Nova API (recomendado para novos apps)
import { File } from 'expo-file-system';
const file = new File(uri);
file.arrayBuffer() // ✅ Funciona
```

---

**Status:** ✅ CORRIGIDO!
**Data:** 22 de Dezembro de 2025

**Solução:** Usar `expo-file-system/legacy`

**Arquivos:**
- `mobile/screens/RequestScreen.js`
- `mobile/screens/PaymentsScreen.js`

**Observação:** API Legacy é totalmente suportada e funcional! Não há problemas em usá-la.

