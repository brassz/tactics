-- SQL para VERIFICAR colunas da tabela USERS
-- Execute no banco: https://zwazrwqrbghdicywipaq.supabase.co

-- Listar todas as colunas da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
