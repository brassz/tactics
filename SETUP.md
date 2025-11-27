# 🚀 Guia de Instalação Completo

## Pré-requisitos

- Node.js 18+ instalado
- Expo CLI instalado (`npm install -g expo-cli`)
- Conta no Supabase (gratuita)

## 📋 Passo a Passo

### 1️⃣ Configurar o Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login ou crie uma conta
3. Selecione seu projeto existente ou crie um novo
4. Vá em **SQL Editor** no menu lateral
5. Cole e execute o SQL do arquivo `/supabase/schema.sql`
6. Vá em **Storage** e crie os buckets:
   - `user-documents` (marque como público)
   - `chat-files` (marque como público)

### 2️⃣ Instalar o App Mobile

```bash
cd mobile
npm install
```

**Configurar variáveis de ambiente:**

O arquivo `.env` já está configurado com as credenciais fornecidas.

**Executar o app:**

```bash
# Iniciar Expo
npm start

# OU específico para plataforma
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

**Testar no celular:**
- Instale o app **Expo Go** no seu celular
- Escaneie o QR code que aparece no terminal

### 3️⃣ Instalar o Painel Admin

```bash
cd admin-panel
npm install
```

**Executar o painel:**

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Login:**
- CPF: `00000000000`

## 🧪 Testar o Sistema

### 1. Cadastro de Cliente (Mobile)

1. Abra o app mobile
2. Clique em "Criar Conta"
3. Insira CPF: `12345678901` e Nome: `João Silva`
4. Clique em "Cadastrar"

### 2. Aprovar Cadastro (Admin)

1. Acesse o painel admin
2. Faça login com CPF: `00000000000`
3. Vá em "Cadastros"
4. Clique em "Gerenciar" no cadastro do João
5. Clique em "Aprovar"

### 3. Enviar Documentos (Mobile)

1. No app, faça login com CPF: `12345678901`
2. O app pedirá para enviar documentos
3. Tire uma selfie e envie os documentos
4. Aguarde aprovação

### 4. Aprovar Documentos (Admin)

1. No painel admin, vá em "Documentos"
2. Visualize os documentos enviados
3. Clique em "Gerenciar Documento"
4. Clique em "Aprovar"

### 5. Solicitar Valor (Mobile)

1. No app, vá em "Solicitar"
2. Digite um valor (ex: 1000.00)
3. Adicione uma justificativa (opcional)
4. Clique em "Enviar Solicitação"

### 6. Aprovar Solicitação (Admin)

1. No painel admin, vá em "Solicitações"
2. Clique em "Gerenciar Solicitação"
3. Clique em "Aprovar"

### 7. Criar Pagamento (Admin)

1. No painel admin, vá em "Pagamentos"
2. Clique em "Novo Pagamento"
3. Selecione o cliente
4. Digite valor e data de vencimento
5. Clique em "Criar Pagamento"

### 8. Testar Chat (Ambos)

**No Mobile:**
1. Vá em "Suporte"
2. Digite uma mensagem
3. Clique em enviar

**No Admin:**
1. Vá em "Chat"
2. Selecione o cliente
3. Responda a mensagem

## 🔧 Solução de Problemas

### Erro ao conectar no Supabase

Verifique se:
- As URLs e chaves estão corretas nos arquivos `.env`
- O schema SQL foi executado corretamente
- Os buckets de storage foram criados

### App mobile não inicia

```bash
# Limpar cache do Expo
cd mobile
rm -rf node_modules
npm install
expo start -c
```

### Admin panel não carrega

```bash
# Limpar cache do Next.js
cd admin-panel
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Erro de permissão ao tirar foto

Certifique-se de que:
- Você está usando um dispositivo físico ou emulador com câmera
- As permissões estão habilitadas no app Expo Go

## 📱 Dispositivos Recomendados

**Para melhor experiência:**
- Celular físico (Android ou iOS) com o Expo Go instalado
- Ou emulador Android Studio / Xcode Simulator

## 🎯 Recursos Adicionais

### Adicionar mais Administradores

Execute no SQL Editor do Supabase:

```sql
INSERT INTO admins (cpf, nome) 
VALUES ('98765432100', 'Maria Admin');
```

### Criar usuários de teste

Execute no SQL Editor do Supabase:

```sql
INSERT INTO users (cpf, nome, status) 
VALUES ('11111111111', 'Teste 1', 'aprovado'),
       ('22222222222', 'Teste 2', 'pendente');
```

## ✅ Checklist Final

- [ ] Supabase schema executado
- [ ] Buckets de storage criados
- [ ] Mobile app instalado e rodando
- [ ] Admin panel instalado e rodando
- [ ] Testado cadastro de cliente
- [ ] Testado aprovação de cadastro
- [ ] Testado upload de documentos
- [ ] Testado solicitação de valor
- [ ] Testado chat em tempo real

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console
2. Confirme que todas as dependências foram instaladas
3. Verifique se o Supabase está online
4. Certifique-se de que as URLs estão corretas

## 🎉 Pronto!

Seu sistema financeiro completo está funcionando!
