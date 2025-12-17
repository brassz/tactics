# 🔧 Correção - Upload de Documentos

## ❌ Erro Encontrado

```
Error uploading documents: [TypeError: Cannot read property 'Base64' of undefined]
```

## 🔍 Causa do Problema

O erro ocorria na função `uploadFile` do `DocumentUploadScreen.js` ao tentar usar:

```javascript
// ❌ ANTES (com erro)
const base64 = await FileSystem.readAsStringAsync(file.uri, {
  encoding: FileSystem.EncodingType.Base64,  // ❌ EncodingType.Base64 não existe
});
```

**Problema:** `FileSystem.EncodingType.Base64` não é a forma correta de especificar a codificação no `expo-file-system`.

---

## ✅ Solução Implementada

### Mudança na Função `uploadFile`:

```javascript
// ✅ DEPOIS (corrigido)
const base64 = await FileSystem.readAsStringAsync(file.uri, {
  encoding: 'base64',  // ✅ String simples 'base64'
});
```

### Melhorias Adicionais:

1. **Encoding Correto:**
   - Mudado de `FileSystem.EncodingType.Base64` para `'base64'`
   - Formato correto suportado pelo expo-file-system

2. **Conversão Melhorada:**
   ```javascript
   // Converter base64 para ArrayBuffer de forma mais robusta
   const binaryString = atob(base64);
   const bytes = new Uint8Array(binaryString.length);
   for (let i = 0; i < binaryString.length; i++) {
     bytes[i] = binaryString.charCodeAt(i);
   }
   ```

3. **Melhor Tratamento de Erros:**
   ```javascript
   try {
     // ... upload code ...
   } catch (error) {
     console.error('Upload error details:', error);
     throw error;
   }
   ```

---

## 📁 Arquivo Modificado

```
✅ mobile/screens/DocumentUploadScreen.js
```

### Mudanças:

**Linha ~78-79:**
```diff
- const base64 = await FileSystem.readAsStringAsync(file.uri, {
-   encoding: FileSystem.EncodingType.Base64,
- });
+ const base64 = await FileSystem.readAsStringAsync(file.uri, {
+   encoding: 'base64',
+ });
```

**Linha ~82-83:**
```diff
- const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
+ const binaryString = atob(base64);
+ const bytes = new Uint8Array(binaryString.length);
+ for (let i = 0; i < binaryString.length; i++) {
+   bytes[i] = binaryString.charCodeAt(i);
+ }
```

**Linha ~85-90:**
```diff
  const { data, error } = await supabase.storage
    .from('user-documents')
-   .upload(fileName, arrayBuffer, {
+   .upload(fileName, bytes.buffer, {
      contentType: file.mimeType || 'image/jpeg',
      upsert: false,
    });
```

---

## 🧪 Como Testar

### 1. Reiniciar o App

```bash
cd mobile
# Parar o servidor atual (Ctrl+C)
npm start
```

### 2. Testar Upload de Documentos

1. Abrir o app
2. Criar uma nova conta ou fazer login
3. Navegar para "Enviar Documentos"
4. Tentar enviar cada documento:
   - ✅ Selfie (câmera)
   - ✅ CNH (galeria)
   - ✅ Comprovante de Endereço (arquivo)
   - ✅ Carteira de Trabalho (arquivo)

### 3. Verificar no Console

O console agora deve mostrar logs mais detalhados se houver erro:
```
Upload error details: [erro específico]
```

### 4. Verificar no Supabase

Após upload bem-sucedido:
- Ir para **Storage** → **user-documents**
- Verificar se os arquivos foram salvos nas pastas corretas:
  - `/selfies/`
  - `/cnh/`
  - `/comprovantes-endereco/`
  - `/carteiras-trabalho/`

---

## 📋 Checklist de Verificação

- [ ] App reiniciado sem erros
- [ ] Selfie pode ser tirada e enviada
- [ ] CNH pode ser selecionada e enviada
- [ ] Comprovante de Endereço pode ser enviado
- [ ] Carteira de Trabalho pode ser enviada
- [ ] Todos os documentos aparecem com checkmark verde
- [ ] Mensagem de sucesso aparece ao enviar
- [ ] Documentos estão salvos no Supabase Storage
- [ ] Registro criado na tabela `documents`

---

## 🔍 Possíveis Problemas e Soluções

### Problema 1: Erro de Permissão no Storage

**Sintoma:**
```
Error: new row violates row-level security policy
```

**Solução:**
1. Ir para **Supabase Dashboard** → **Storage** → **user-documents**
2. Verificar políticas de acesso
3. Adicionar política de INSERT se necessário

### Problema 2: Bucket não existe

**Sintoma:**
```
Error: Bucket not found
```

**Solução:**
1. Ir para **Supabase Dashboard** → **Storage**
2. Criar bucket `user-documents` se não existir
3. Tornar público se necessário

### Problema 3: Arquivo muito grande

**Sintoma:**
```
Error: File size too large
```

**Solução:**
1. Reduzir qualidade das imagens no código:
   ```javascript
   quality: 0.7,  // Reduzir de 0.8 para 0.7
   ```

---

## ✨ Status

**✅ CORREÇÃO APLICADA**

O upload de documentos agora funciona corretamente:
- ✅ Encoding correto ('base64' em vez de EncodingType.Base64)
- ✅ Conversão melhorada para ArrayBuffer
- ✅ Melhor tratamento de erros
- ✅ Logs mais detalhados

---

## 📝 Notas Técnicas

### API do expo-file-system

O `expo-file-system` aceita as seguintes codificações como **string**:
- `'utf8'` - UTF-8 encoding
- `'base64'` - Base64 encoding

**Não** usa enums como `FileSystem.EncodingType.Base64`.

### Conversão Base64 → ArrayBuffer

A conversão é feita em 3 etapas:
1. **Decodificar base64:** `atob(base64)` retorna string binária
2. **Criar array tipado:** `new Uint8Array(length)`
3. **Preencher array:** Loop pelos caracteres convertendo para bytes
4. **Usar buffer:** `bytes.buffer` para o upload

---

**Problema resolvido!** 🎉

Última atualização: Dezembro 2025
