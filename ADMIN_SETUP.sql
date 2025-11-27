-- ========================================
-- SCRIPT PARA CRIAR ADMINISTRADOR
-- ========================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- (https://zwazrwqrbghdicywipaq.supabase.co)

-- 1. Adicionar política de INSERT para tabela admins (se necessário)
CREATE POLICY "Enable insert access for admins table" 
ON admins FOR INSERT 
WITH CHECK (true);

-- 2. Inserir o administrador
INSERT INTO admins (cpf, nome) 
VALUES ('42483289843', 'Admin JA')
ON CONFLICT (cpf) DO UPDATE 
SET nome = EXCLUDED.nome;

-- 3. Verificar se o admin foi criado
SELECT * FROM admins WHERE cpf = '42483289843';
