# 🔐 Instruções para Criar Acesso Administrador

## Credenciais do Administrador
- **CPF**: `42483289843`
- **Nome**: `Admin JA`

## Como Criar o Administrador

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard:
   ```
   https://zwazrwqrbghdicywipaq.supabase.co
   ```

2. Vá para **SQL Editor** no menu lateral

3. Copie e cole o conteúdo do arquivo `ADMIN_SETUP.sql`

4. Clique em **Run** para executar o script

5. Verifique se o admin foi criado com sucesso na resposta

### Opção 2: Via Table Editor

1. Acesse o Supabase Dashboard:
   ```
   https://zwazrwqrbghdicywipaq.supabase.co
   ```

2. Vá para **Table Editor** > **admins**

3. Clique em **Insert** > **Insert row**

4. Preencha os campos:
   - **cpf**: `42483289843`
   - **nome**: `Admin JA`

5. Clique em **Save**

## Verificação

Após criar o administrador, você pode verificar se ele foi criado corretamente:

1. Acesse **Table Editor** > **admins**
2. Procure pela linha com CPF `42483289843`
3. Confirme que o nome é `Admin JA`

## Uso no Sistema

O administrador poderá fazer login no painel administrativo usando o CPF `42483289843`.

---

✅ **Arquivos criados:**
- `/workspace/ADMIN_SETUP.sql` - Script SQL para criar o admin
- `/workspace/admin-panel/.env` - Configurações do painel admin
- `/workspace/mobile/.env` - Configurações do app mobile
