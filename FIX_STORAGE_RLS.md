# 🔐 Fix - Erro de Políticas de Storage

## ❌ Erro

```
StorageApiError: new row violates row-level security policy
```

## 🔍 Causa

O Supabase Storage tem **Row Level Security (RLS)** ativado, mas não há políticas configuradas para permitir uploads no bucket `user-documents`.

---

## ✅ Solução

### Opção 1: Executar SQL (Recomendado)

1. **Abra o Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o seguinte SQL:

```sql
-- Permitir INSERT (upload) para todos
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

-- Permitir SELECT (visualização) para todos
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-documents');

-- Permitir UPDATE para todos
CREATE POLICY "Allow public updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');

-- Permitir DELETE para todos
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'user-documents');
```

**Ou execute o arquivo:**
```
supabase/storage-policies-documents.sql
```

---

### Opção 2: Interface do Supabase (Alternativa)

Se preferir usar a interface:

1. **Abra o Supabase Dashboard**
2. Vá para **Storage** → **Buckets**
3. Clique em `user-documents`
4. Vá para a aba **Policies**
5. Clique em **New Policy**

**Criar 4 políticas:**

#### Política 1: Upload (INSERT)
- **Policy name:** `Allow public uploads`
- **Allowed operation:** `INSERT`
- **Target roles:** `public`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents'
  ```

#### Política 2: Leitura (SELECT)
- **Policy name:** `Allow public read access`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents'
  ```

#### Política 3: Atualização (UPDATE)
- **Policy name:** `Allow public updates`
- **Allowed operation:** `UPDATE`
- **Target roles:** `public`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents'
  ```

#### Política 4: Exclusão (DELETE)
- **Policy name:** `Allow public deletes`
- **Allowed operation:** `DELETE`
- **Target roles:** `public`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents'
  ```

---

## 🧪 Testar Após Aplicar

```bash
cd mobile
npm start
```

1. Criar conta
2. Enviar documentos
3. ✅ Deve funcionar sem erros!

---

## 🔒 Segurança

### ⚠️ Nota Importante

As políticas acima permitem acesso **público** ao bucket. Isso é adequado para:
- Aplicativos em desenvolvimento
- Documentos que serão validados posteriormente
- Sistemas com validação no backend

### 🔐 Para Produção (Mais Seguro)

Se quiser restringir apenas para usuários autenticados:

```sql
-- Apenas usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-documents');

-- Apenas donos podem ler seus documentos
CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📋 Checklist

Após executar as políticas:

- [ ] SQL executado sem erros
- [ ] 4 políticas aparecem na aba Policies
- [ ] App reiniciado
- [ ] Upload de documentos funciona
- [ ] Arquivos aparecem no Storage
- [ ] Registros criados na tabela `documents`

---

## 🔍 Verificar Políticas

Para verificar se as políticas foram criadas:

```sql
-- Ver todas as políticas do storage
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Deve retornar as 4 políticas criadas.

---

## 🚨 Troubleshooting

### Erro: "policy already exists"

**Causa:** Política já foi criada anteriormente.

**Solução:**
```sql
-- Deletar políticas existentes
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Depois recriar as políticas
```

### Erro: "bucket not found"

**Causa:** Bucket `user-documents` não existe.

**Solução:**
1. Ir para **Storage** → **New bucket**
2. Nome: `user-documents`
3. Public: ✅ (marcar)
4. Criar o bucket

---

## 📁 Arquivo Criado

```
✅ supabase/storage-policies-documents.sql
```

Execute este arquivo no SQL Editor do Supabase para aplicar todas as políticas de uma vez.

---

## ✅ Resultado

Após aplicar as políticas:

- ✅ Uploads funcionam normalmente
- ✅ Arquivos salvos no Storage
- ✅ URLs públicas geradas
- ✅ Documentos registrados no banco

**Problema resolvido!** 🎉

---

**Última atualização:** Dezembro 2025
