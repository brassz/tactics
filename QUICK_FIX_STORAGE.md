# ⚡ Quick Fix - Políticas de Storage

## ❌ Erro

```
StorageApiError: new row violates row-level security policy
```

## ✅ Solução Rápida

### Execute no SQL Editor do Supabase:

```sql
-- Permitir uploads no bucket user-documents
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

-- Permitir leitura
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-documents');

-- Permitir atualização
CREATE POLICY "Allow public updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');

-- Permitir exclusão
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'user-documents');
```

---

## 📍 Onde Executar

1. **Supabase Dashboard** → **SQL Editor**
2. Cole o SQL acima
3. Clique em **Run**
4. Aguarde "Success" ✅

**Ou execute o arquivo:**
```
supabase/storage-policies-documents.sql
```

---

## 🧪 Testar

```bash
cd mobile
npm start
```

Enviar documentos → ✅ Deve funcionar!

---

## 📚 Mais Detalhes

Ver: `FIX_STORAGE_RLS.md`

---

**Problema resolvido!** 🎉
