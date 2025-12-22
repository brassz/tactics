# 🚀 EXECUTAR AGORA - Funcionalidades de Segurança

## ⚡ Início Rápido (5 minutos)

### Passo 1: Executar SQL no Supabase (2 min)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo do arquivo:

```
supabase/migration-facial-captures.sql
```

**OU** execute este SQL diretamente:

```sql
-- Tabela para armazenar capturas faciais
CREATE TABLE IF NOT EXISTS capturas_faciais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo_operacao VARCHAR(50) NOT NULL CHECK (tipo_operacao IN ('solicitacao_valor', 'pagamento', 'login')),
  imagem_url TEXT NOT NULL,
  id_solicitacao UUID REFERENCES solicitacoes_valores(id) ON DELETE SET NULL,
  id_pagamento UUID REFERENCES pagamentos(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_capturas_user ON capturas_faciais(id_user);
CREATE INDEX idx_capturas_tipo ON capturas_faciais(tipo_operacao);
CREATE INDEX idx_capturas_solicitacao ON capturas_faciais(id_solicitacao);
CREATE INDEX idx_capturas_pagamento ON capturas_faciais(id_pagamento);
CREATE INDEX idx_capturas_created ON capturas_faciais(created_at);

-- Enable RLS
ALTER TABLE capturas_faciais ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Enable all access for capturas_faciais" ON capturas_faciais FOR ALL USING (true);
```

✅ **Resultado esperado:** "Success. No rows returned"

---

### Passo 2: Verificar Storage (1 min)

1. No Supabase Dashboard, vá em **Storage**
2. Verifique se o bucket `user-documents` existe
3. Se não existir, crie-o:
   - Clique em "New bucket"
   - Nome: `user-documents`
   - Public: ✅ Sim
   - Clique em "Create bucket"

✅ **Resultado esperado:** Bucket `user-documents` aparece na lista

---

### Passo 3: Instalar Dependências (1 min)

Abra o terminal e execute:

```bash
cd mobile
npm install
```

✅ **Resultado esperado:** Instalação sem erros

---

### Passo 4: Executar o App (1 min)

```bash
cd mobile
npm start
```

Escolha uma opção:
- `a` - Android
- `i` - iOS
- Escaneie o QR Code com o Expo Go

✅ **Resultado esperado:** App abre no dispositivo

---

## 🧪 Testar Rapidamente

### Teste 1: Login com Biometria (30 segundos)

1. Abra o app
2. Clique em "Entrar"
3. Digite um CPF válido (ex: 12345678901)
4. Clique em "Entrar"
5. Confirme a autenticação biométrica

✅ **Sucesso:** Login realizado

---

### Teste 2: Solicitação com Captura Facial (1 minuto)

1. Faça login como cliente
2. Vá para aba "Solicitar"
3. Digite valor: 1000.00
4. Clique em "Enviar Solicitação"
5. Clique em "Continuar" no alerta
6. Tire uma foto do seu rosto
7. Clique em "Confirmar"

✅ **Sucesso:** Mensagem "Solicitação enviada com sucesso"

---

### Teste 3: Verificar no Banco (30 segundos)

No Supabase Dashboard, SQL Editor:

```sql
SELECT * FROM capturas_faciais ORDER BY created_at DESC LIMIT 5;
```

✅ **Sucesso:** Você vê a captura facial que acabou de fazer

---

## 📊 Verificação Automática

Execute o script de verificação:

```bash
node verificar-seguranca.js
```

**Antes de executar**, edite o arquivo e adicione suas credenciais:

```javascript
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_KEY_AQUI';
```

✅ **Sucesso:** Todas as verificações passam

---

## 🎯 O Que Foi Implementado

### ✅ Funcionalidades Prontas:

1. **Autenticação Biométrica no Login**
   - Face ID / Touch ID / PIN do dispositivo
   - Funciona em iOS e Android

2. **Captura Facial em Solicitações**
   - Obrigatória ao solicitar valores
   - Imagem salva no Supabase Storage
   - Vinculada à solicitação

3. **Captura Facial em Pagamentos**
   - Obrigatória ao realizar pagamentos
   - Imagem salva no Supabase Storage
   - Vinculada ao pagamento

4. **Admin Visualiza Documentos**
   - Painel web: `admin-panel/app/dashboard/documents`
   - App mobile: Tela "Documentos"
   - Preview de imagens e download de PDFs

---

## 📁 Arquivos Importantes

### Código:
- `mobile/screens/LoginScreen.js` - Login com biometria
- `mobile/screens/RequestScreen.js` - Solicitação com captura
- `mobile/screens/PaymentsScreen.js` - Pagamento com captura
- `mobile/components/FacialCaptureModal.js` - Componente de captura

### Banco de Dados:
- `supabase/migration-facial-captures.sql` - Migration
- `supabase/schema.sql` - Schema completo atualizado

### Documentação:
- `README_SEGURANCA.md` - Guia completo
- `IMPLEMENTACAO_SEGURANCA.md` - Detalhes técnicos
- `GUIA_TESTE_SEGURANCA.md` - Guia de testes
- `RESUMO_IMPLEMENTACAO_SEGURANCA.md` - Resumo executivo

### Scripts:
- `verificar-seguranca.js` - Verificação automática

---

## 🔧 Comandos Úteis

### Reinstalar dependências:
```bash
cd mobile
rm -rf node_modules
npm install
```

### Limpar cache do Expo:
```bash
cd mobile
npx expo start --clear
```

### Ver logs do app:
```bash
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

### Consultar banco:
```sql
-- Ver todas as capturas
SELECT * FROM capturas_faciais ORDER BY created_at DESC;

-- Ver capturas por usuário
SELECT * FROM capturas_faciais WHERE id_user = 'USER_ID';

-- Ver solicitações com capturas
SELECT 
  sv.*,
  cf.imagem_url
FROM solicitacoes_valores sv
LEFT JOIN capturas_faciais cf ON cf.id_solicitacao = sv.id;
```

---

## ⚠️ Problemas Comuns

### Problema: "Tabela capturas_faciais não existe"
**Solução:** Execute o SQL do Passo 1

### Problema: "Bucket user-documents não encontrado"
**Solução:** Crie o bucket no Passo 2

### Problema: "Câmera não abre"
**Solução:** Verifique permissões nas configurações do dispositivo

### Problema: "Biometria não funciona"
**Solução:** Use um dispositivo físico (não emulador)

### Problema: "Upload falha"
**Solução:** Verifique políticas de storage no Supabase

---

## 📱 Dispositivos Recomendados

### ✅ Recomendado:
- iPhone físico (Face ID)
- Android físico (impressão digital)

### ⚠️ Limitado:
- Emulador iOS (sem Face ID real)
- Emulador Android (sem biometria real)

**Dica:** Para melhor experiência, use dispositivo físico!

---

## 🎓 Fluxos Implementados

### Login:
```
CPF → Biometria → Login
```

### Solicitação:
```
Valor → Alerta → Câmera → Foto → Upload → Solicitação
```

### Pagamento:
```
Parcela → Confirmação → Câmera → Foto → Upload → Pagamento
```

---

## 📞 Suporte

Se precisar de ajuda:

1. ✅ Consulte `README_SEGURANCA.md`
2. ✅ Execute `verificar-seguranca.js`
3. ✅ Verifique os logs do console
4. ✅ Revise `GUIA_TESTE_SEGURANCA.md`

---

## 🎉 Pronto!

Agora você tem um sistema completo com:

✅ Autenticação biométrica
✅ Captura facial em operações sensíveis
✅ Auditoria completa
✅ Admin visualiza documentos

**Tempo total de setup: ~5 minutos**

**Boa sorte! 🚀**

