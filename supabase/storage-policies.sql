-- =============================================
-- POLÍTICAS DE STORAGE DO SUPABASE
-- Execute este SQL após criar os buckets
-- =============================================

-- Bucket: user-documents
-- Permite leitura pública e upload autenticado

-- Política de leitura pública
CREATE POLICY "Public read access for user-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-documents');

-- Política de upload
CREATE POLICY "Authenticated users can upload to user-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-documents');

-- Política de update
CREATE POLICY "Users can update their own files in user-documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-documents');

-- Política de delete
CREATE POLICY "Users can delete their own files in user-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-documents');

-- =============================================

-- Bucket: chat-files
-- Permite leitura pública e upload autenticado

-- Política de leitura pública
CREATE POLICY "Public read access for chat-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

-- Política de upload
CREATE POLICY "Authenticated users can upload to chat-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files');

-- Política de update
CREATE POLICY "Users can update their own files in chat-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-files');

-- Política de delete
CREATE POLICY "Users can delete their own files in chat-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-files');

-- =============================================
-- NOTAS:
-- 1. Execute este script após criar os buckets
-- 2. Certifique-se de que os buckets estão marcados como "públicos"
-- 3. As políticas permitem acesso anônimo para simplificar
-- 4. Em produção, ajuste as políticas para maior segurança
-- =============================================
