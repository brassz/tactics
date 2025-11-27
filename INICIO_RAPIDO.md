# 🚀 Início Rápido - Sistema Completo

## ✅ Suas Credenciais (CPF: 42483289843)

Você tem **dois tipos de acesso** configurados:

---

## 1️⃣ Painel Administrativo (Web) 

### 🖥️ Para gerenciar o sistema

**Como iniciar**:
```bash
cd admin-panel
npm install
npm run dev
```

**Acesse**: http://localhost:3000

**Login**:
- Digite: `42483289843`
- Clique em "Entrar"

**O que você pode fazer**:
- ✅ Gerenciar usuários
- ✅ Aprovar/reprovar cadastros
- ✅ Analisar documentos
- ✅ Aprovar solicitações de valores
- ✅ Gerenciar pagamentos
- ✅ Chat com clientes

---

## 2️⃣ App Mobile (Expo)

### 📱 Para usar como cliente ou admin

**Como iniciar**:
```bash
cd mobile
npm install
npx expo start
```

**No app**:
1. Clique em **"Já tenho conta"**
2. Digite seu CPF: `42483289843` (ou outro CPF de admin)
3. Clique em "Entrar"
4. Se for admin, login é automático! ✨

**Novidade**: 🎉 **Administradores agora podem fazer login no app mobile!**

**CPFs de Admin que funcionam no mobile**:
- `05050149045` (Bruno)
- `42483289843` (Admin JA)
- `00000000000` (Administrador Master)

**O que você pode fazer**:
- ✅ Solicitar valores
- ✅ Enviar documentos
- ✅ Chat com suporte
- ✅ Ver pagamentos
- ✅ Acompanhar solicitações

---

## 📊 Resumo dos Acessos

| Plataforma | URL/Local | Tipo | CPF |
|------------|-----------|------|-----|
| **Painel Admin** | http://localhost:3000 | Admin | 42483289843 |
| **App Mobile** | Expo | Admin ou Usuário | 42483289843 |

💡 **Dica**: Qualquer CPF cadastrado na tabela `admins` pode fazer login no app mobile!

---

## 🔧 Solução de Problemas

### Painel Admin não aceita login?
1. Reinicie o servidor: `cd admin-panel && npm run dev`
2. Limpe cache do navegador: `Ctrl+Shift+R`
3. Use janela anônima

### App Mobile mostra "CPF não encontrado"?

**Para administradores**: O CPF deve estar na tabela `admins` do Supabase.

**Para usuários**: O CPF deve estar na tabela `users` do Supabase.

Teste se seu CPF funciona:
```bash
node /workspace/testar-login-admin-mobile.js
```

---

## 📁 Arquivos de Configuração

- ✅ `/workspace/admin-panel/.env` - Credenciais do painel
- ✅ `/workspace/mobile/.env` - Credenciais do app
- ✅ `/workspace/MOBILE_LOGIN.md` - Guia do app mobile
- ✅ `/workspace/RESUMO_FINAL.md` - Guia do painel admin

---

## 🎯 Fluxo Completo do Sistema

### Como Cliente (App Mobile):
1. Criar conta ou fazer login
2. Enviar documentos
3. Aguardar aprovação do admin
4. Solicitar valores
5. Receber valores e pagar

### Como Admin (Painel Web):
1. Fazer login
2. Aprovar/reprovar cadastros
3. Analisar documentos
4. Aprovar solicitações de valores
5. Gerenciar pagamentos
6. Atender via chat

---

✅ **Tudo configurado e pronto para usar!**
