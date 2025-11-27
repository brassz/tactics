# 🔐 Administradores Cadastrados

## ✅ Total: 3 Administradores

---

## 1️⃣ Administrador Principal (NOVO!)

**CPF**: `05050149045`  
**Nome**: Administrador  
**Status**: ✅ Ativo  
**Criado em**: 27/11/2025, 16:39:00

---

## 2️⃣ Admin JA

**CPF**: `42483289843`  
**Nome**: Admin JA  
**Status**: ✅ Ativo  
**Criado em**: 27/11/2025, 16:32:55

**Observação**: Este CPF também tem acesso como **usuário** no app mobile.

---

## 3️⃣ Administrador Master

**CPF**: `00000000000`  
**Nome**: Administrador Master  
**Status**: ✅ Ativo (Admin padrão do sistema)  
**Criado em**: 27/11/2025, 15:43:39

---

## 🚀 Como Fazer Login no Painel Admin

### Passo 1: Inicie o servidor

```bash
cd admin-panel
npm install
npm run dev
```

### Passo 2: Acesse o painel

Abra seu navegador em: **http://localhost:3000**

### Passo 3: Faça login

Digite um dos CPFs acima (apenas números):
- `05050149045` ← **Seu novo admin**
- `42483289843`
- `00000000000`

---

## 📊 Resumo dos Acessos

| CPF | Nome | Onde usar | Tipo |
|-----|------|-----------|------|
| **05050149045** | Administrador | Painel Web | Admin |
| 42483289843 | Admin JA | Painel Web | Admin |
| 42483289843 | JA | App Mobile | Usuário |
| 00000000000 | Administrador Master | Painel Web | Admin |

---

## 🔧 Scripts Úteis

### Listar todos os admins:
```bash
npm install @supabase/supabase-js && node listar-admins.js
```

### Criar novo admin:
```bash
npm install @supabase/supabase-js && node criar-admin-novo.js
```

### Verificar configuração completa:
```bash
npm install @supabase/supabase-js && node verificar-tudo.js
```

---

## 📁 Arquivos Disponíveis

- 📖 **`INICIO_RAPIDO.md`** - Guia rápido do sistema
- 📖 **`ADMINS_CADASTRADOS.md`** - Este arquivo
- 📖 **`MOBILE_LOGIN.md`** - Guia do app mobile
- 🔧 **`listar-admins.js`** - Listar todos os admins
- 🔧 **`criar-admin-novo.js`** - Criar novos admins
- 🔧 **`verificar-tudo.js`** - Verificação completa

---

**Data de atualização**: 27/11/2025, 16:39  
**Banco de dados**: zwazrwqrbghdicywipaq.supabase.co
