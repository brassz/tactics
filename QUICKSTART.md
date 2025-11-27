# ⚡ Quick Start - 5 Minutos

Comece a usar o sistema em menos de 5 minutos!

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase (gratuita)

## 🚀 Passo a Passo Rápido

### 1️⃣ Configure o Supabase (2 min)

```bash
# 1. Acesse https://app.supabase.com
# 2. Faça login
# 3. Vá em SQL Editor
# 4. Cole e execute este arquivo:
cat supabase/schema.sql

# 5. Vá em Storage e crie 2 buckets (marque como públicos):
# - user-documents
# - chat-files

# 6. Execute as políticas:
cat supabase/storage-policies.sql
```

### 2️⃣ Inicie o Mobile (1 min)

```bash
cd mobile
npm install
npm start

# Escaneie o QR code com o app Expo Go
```

### 3️⃣ Inicie o Admin (1 min)

```bash
cd admin-panel
npm install
npm run dev

# Acesse http://localhost:3000
# Login com CPF: 00000000000
```

### 4️⃣ Teste Rápido (1 min)

**No Mobile:**
1. Clique em "Criar Conta"
2. CPF: 12345678901
3. Nome: Teste Cliente
4. Cadastrar

**No Admin:**
1. Veja o novo cadastro em "Cadastros"
2. Clique em "Gerenciar"
3. Clique em "Aprovar"

**No Mobile:**
1. Faça login com CPF: 12345678901
2. Envie os documentos (fotos de teste)
3. Explore as funcionalidades!

## ✅ Pronto!

Seu sistema está funcionando!

## 🎯 Próximos Passos

1. Leia o [README.md](README.md) para visão completa
2. Consulte [SETUP.md](SETUP.md) para detalhes
3. Veja [TROUBLESHOOTING.md](TROUBLESHOOTING.md) se tiver problemas

## 📱 Funcionalidades Principais

### Mobile
- ✅ Cadastro e login
- ✅ Upload de documentos
- ✅ Solicitação de valores
- ✅ Ver pagamentos
- ✅ Chat com suporte

### Admin
- ✅ Aprovar cadastros
- ✅ Verificar documentos
- ✅ Gerenciar solicitações
- ✅ Criar pagamentos
- ✅ Chat com clientes

## 🔑 Credenciais

**Admin Padrão:**
- CPF: `00000000000`

**Supabase:**
- URL: Já configurada em `.env`
- Key: Já configurada em `.env`

## 🐛 Problemas?

```bash
# Limpar e reinstalar tudo
cd mobile && rm -rf node_modules && npm install
cd ../admin-panel && rm -rf node_modules && npm install

# Ou consulte TROUBLESHOOTING.md
```

---

**Tudo pronto em 5 minutos! 🎉**
