# 🔧 Guia de Solução de Problemas - Login Admin

## ✅ Status da Configuração

O administrador está **corretamente configurado** no banco de dados:
- **CPF**: `42483289843`
- **Nome**: `Admin JA`
- **Status**: ✅ Verificado e funcionando

## 🚨 Problemas Comuns e Soluções

### 1. Servidor não reiniciado após criar .env

**Problema**: O Next.js não detecta automaticamente mudanças no arquivo `.env`

**Solução**:
```bash
cd admin-panel
# Pare o servidor (Ctrl+C) e reinicie:
npm run dev
```

### 2. Cache do navegador

**Problema**: O navegador pode estar usando dados em cache

**Solução**:
1. Abra as Ferramentas do Desenvolvedor (F12)
2. Clique com botão direito no botão de atualizar
3. Selecione "Limpar cache e recarregar" (Hard Reload)

**OU**

Abra uma janela anônima/privada

### 3. Arquivo .env não foi criado ou está vazio

**Solução**: Verifique se existe o arquivo `/workspace/admin-panel/.env` com:
```
NEXT_PUBLIC_SUPABASE_URL=https://zwazrwqrbghdicywipaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0
```

### 4. Formato do CPF incorreto

**Problema**: CPF digitado com pontos ou traços

**Solução**: Digite apenas os números: `42483289843`

### 5. Erro de conexão com Supabase

**Solução**: Abra o Console do navegador (F12) e verifique se há erros de rede

## 🧪 Como Testar

### Teste 1: Verificar arquivo .env
```bash
cd /workspace/admin-panel
cat .env
```

### Teste 2: Verificar se o servidor está rodando
```bash
cd /workspace/admin-panel
npm run dev
```

O servidor deve iniciar em `http://localhost:3000`

### Teste 3: Verificar no Console do Navegador

1. Abra o painel admin no navegador
2. Pressione F12 para abrir DevTools
3. Vá na aba "Console"
4. Digite o CPF e clique em "Entrar"
5. Observe se aparecem erros no console

## 📝 Instruções de Login

1. **Inicie o servidor do admin-panel**:
   ```bash
   cd /workspace/admin-panel
   npm install
   npm run dev
   ```

2. **Acesse**: http://localhost:3000

3. **Digite o CPF**: `42483289843` (apenas números)

4. **Clique em**: "Entrar"

## 🔍 Outros CPFs Disponíveis

- `00000000000` - Administrador Master (padrão do sistema)
- `42483289843` - Admin JA (seu admin criado)

## ❓ Qual erro você está vendo?

Por favor, informe:
- [ ] "CPF de administrador não encontrado"
- [ ] Página fica carregando infinitamente
- [ ] Erro de rede no console
- [ ] Outro erro (qual?)

---

**Arquivos de Verificação Criados**:
- `/workspace/verify-admin.js` - Verifica admins no banco
- `/workspace/test-login.js` - Testa o processo de login
