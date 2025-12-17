-- Políticas de Storage para o bucket user-documents
-- Executar no SQL Editor do Supabase

-- 1. Permitir INSERT (upload) para todos
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

-- 2. Permitir SELECT (visualização) para todos
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-documents');

-- 3. Permitir UPDATE para todos
CREATE POLICY "Allow public updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');

-- 4. Permitir DELETE para todos
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'user-documents');
