# Configuração do Supabase

## 🔧 Passos para configurar o banco de dados

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole e execute o conteúdo do arquivo `schema.sql`
5. Vá em "Storage" e crie os seguintes buckets:
   - `user-documents` (público para leitura)
   - `chat-files` (público para leitura)

## 📦 Buckets de Storage

### user-documents
Para armazenar:
- Selfies
- Documentos RG/CNH
- Comprovantes de endereço
- Comprovantes de renda
- Carteiras de trabalho (PDF)

### chat-files
Para armazenar:
- Anexos enviados no chat

## 🔑 Políticas de Storage

Execute no SQL Editor após criar os buckets:

```sql
-- Política para user-documents
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'user-documents');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-documents');

-- Política para chat-files
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files');
```

## 👤 Admin Padrão

CPF: `00000000000`
Nome: Administrador Master

Use este CPF para fazer login no painel admin.
