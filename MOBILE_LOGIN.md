# 📱 Como Fazer Login no App Mobile (Expo)

## ✅ Usuário Criado com Sucesso!

**CPF**: `42483289843`  
**Nome**: JA  
**Status**: Aprovado ✓

---

## 🚀 Como fazer login no app:

### 1️⃣ Inicie o app Expo

```bash
cd mobile
npm install
npx expo start
```

### 2️⃣ No app, clique em **"Já tenho conta"**

### 3️⃣ Digite o CPF:

```
42483289843
```

### 4️⃣ Clique em **"Entrar"**

### 5️⃣ Faça upload dos documentos (se solicitado)

O sistema vai pedir para você enviar:
- Selfie
- CNH ou RG
- Comprovante de endereço
- Comprovante de renda
- Carteira de trabalho (PDF)

Depois disso, você terá acesso completo ao app! 🎉

---

## 📋 Diferença entre Admin e Usuário

| Tipo | CPF | Onde usar | Para que serve |
|------|-----|-----------|----------------|
| **Admin** | 42483289843 | Painel Web (localhost:3000) | Gerenciar usuários, aprovar solicitações |
| **Usuário** | 42483289843 | App Mobile (Expo) | Solicitar valores, enviar documentos, chat |

✅ Você tem **ambos** configurados agora!

---

## 🔧 Se aparecer erro "CPF não encontrado"

Execute este comando:
```bash
node /workspace/criar-usuario-mobile.js
```

---

## 🧪 Verificar se o usuário existe

```bash
cd /workspace
npm install @supabase/supabase-js
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zwazrwqrbghdicywipaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0'
);
(async () => {
  const { data } = await supabase.from('users').select('*').eq('cpf', '42483289843').single();
  console.log(data ? '✅ Usuário encontrado: ' + data.nome : '❌ Usuário não encontrado');
})();
"
```

---

## 🎯 Próximos Passos no App

Depois de fazer login, você poderá:

1. ✅ Enviar documentos
2. 💰 Solicitar valores
3. 💬 Conversar com o suporte via chat
4. 💳 Visualizar pagamentos
5. 📄 Acompanhar solicitações

---

**Status**: ✅ Configurado e pronto para usar!
