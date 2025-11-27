# 🔐 Como Fazer Login no Painel Administrativo

## ✅ Configuração Verificada

✔️ Administrador criado no banco de dados  
✔️ Credenciais configuradas nos arquivos `.env`  
✔️ Conexão com Supabase testada e funcionando  

## 🚀 Passo a Passo para Logar

### 1️⃣ Inicie o servidor do painel admin

```bash
cd admin-panel
npm install
npm run dev
```

### 2️⃣ Acesse o painel

Abra seu navegador em: **http://localhost:3000**

### 3️⃣ Faça login com as credenciais

Digite no campo "CPF do Administrador":

```
42483289843
```

**⚠️ IMPORTANTE**: Digite apenas os números, sem pontos ou traços!

### 4️⃣ Clique em "Entrar"

Você será redirecionado para o dashboard administrativo.

---

## 🔧 Se não estiver funcionando

### Solução Rápida (mais comum):

1. **Pare o servidor** (pressione `Ctrl+C` no terminal)
2. **Reinicie o servidor**:
   ```bash
   cd admin-panel
   npm run dev
   ```
3. **Limpe o cache do navegador**:
   - Pressione `Ctrl+Shift+R` (Windows/Linux)
   - Pressione `Cmd+Shift+R` (Mac)
   - OU abra uma janela anônima

### Verificar Configuração:

Execute no terminal:
```bash
node /workspace/verify-admin.js
```

Deve mostrar:
```
✅ Admin encontrado!
   CPF: 42483289843
   Nome: Admin JA
```

### Testar Login:

Execute no terminal:
```bash
node /workspace/test-login.js
```

Deve mostrar: `✅ LOGIN BEM-SUCEDIDO!`

---

## 📋 CPFs Disponíveis

Você pode usar qualquer um destes CPFs para fazer login:

| CPF | Nome | Descrição |
|-----|------|-----------|
| `42483289843` | Admin JA | Seu administrador principal |
| `00000000000` | Administrador Master | Admin padrão do sistema |

---

## ❓ Precisa de Ajuda?

Consulte o arquivo **LOGIN_TROUBLESHOOTING.md** para mais detalhes sobre:
- Erros comuns e soluções
- Como depurar problemas
- Verificações adicionais

---

## 📁 Arquivos de Configuração

- ✅ `/workspace/admin-panel/.env` - Credenciais do Supabase
- ✅ `/workspace/mobile/.env` - Credenciais do app mobile
- ✅ `/workspace/verify-admin.js` - Script de verificação
- ✅ `/workspace/test-login.js` - Script de teste de login
