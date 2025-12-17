# 🧪 Guia de Teste - Registro Completo

## 📋 Checklist de Testes

### 1️⃣ Preparação (IMPORTANTE!)

**Execute a migração SQL primeiro:**

```sql
-- Abra o SQL Editor do Supabase e execute:

ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
```

✅ **Confirme que o SQL foi executado com sucesso antes de continuar!**

---

### 2️⃣ Teste do Formulário de Registro

#### 📱 Acessar o App
```bash
cd mobile
npm start
# ou
npx expo start
```

#### ✅ Verificar Campos do Formulário

Ao clicar em **"Criar Conta"**, verifique se os seguintes campos estão presentes:

- [ ] CPF * (com placeholder "00000000000")
- [ ] Nome Completo * (com placeholder "Seu nome completo")
- [ ] Celular * (com placeholder "11999999999")
- [ ] Email * (com placeholder "seu@email.com")
- [ ] RG (com placeholder "000000000")
- [ ] Data de Nascimento (com placeholder "DD/MM/AAAA")
- [ ] Contato de Emergência (com placeholder "11999999999")
- [ ] Texto "* Campos obrigatórios" no final
- [ ] Botão "Cadastrar"

---

### 3️⃣ Teste de Validações

#### ❌ Teste 1: Campos vazios
```
Ação: Clicar em "Cadastrar" sem preencher nada
Resultado esperado: Alerta "Por favor, preencha todos os campos obrigatórios"
```

#### ❌ Teste 2: CPF inválido
```
Ação: Preencher CPF com menos de 11 dígitos
Resultado esperado: Alerta "CPF deve conter 11 dígitos"
```

#### ❌ Teste 3: Celular inválido
```
Ação: Preencher celular com menos de 11 dígitos
Resultado esperado: Alerta "Celular deve conter DDD + 9 dígitos"
```

#### ❌ Teste 4: Email inválido
```
Ação: Preencher email sem @ ou domínio
Resultado esperado: Alerta "Por favor, insira um email válido"
```

#### ✅ Teste 5: Formatação automática
```
Ação: Digitar números em CPF, Celular, RG
Resultado esperado: Aceitar apenas números, limitar tamanho
```

#### ✅ Teste 6: Formatação de data
```
Ação: Digitar "25121990" em Data de Nascimento
Resultado esperado: Automaticamente formatar para "25/12/1990"
```

---

### 4️⃣ Teste de Cadastro Bem-Sucedido

#### Dados de Teste:
```
CPF: 12345678901
Nome: João da Silva Teste
Celular: 11987654321
Email: joao.teste@email.com
RG: 123456789 (opcional)
Data de Nascimento: 25/12/1990 (opcional)
Contato de Emergência: 11912345678 (opcional)
```

#### ✅ Verificações:
- [ ] Clicar em "Cadastrar"
- [ ] Ver loading (spinner)
- [ ] Ver alerta "Cadastro realizado! Agora envie seus documentos para análise."
- [ ] Clicar em "Continuar"
- [ ] Ser redirecionado automaticamente para tela de documentos

---

### 5️⃣ Teste de Upload de Documentos

Na tela de documentos, verificar:

#### 📸 Selfie
- [ ] Clicar em "Tirar foto"
- [ ] Permissão de câmera solicitada
- [ ] Tirar foto
- [ ] Ver preview da foto
- [ ] Ver checkmark verde "✓ Foto enviada"

#### 🪪 CNH
- [ ] Clicar em "Enviar foto"
- [ ] Selecionar imagem da galeria
- [ ] Ver checkmark verde "✓ Documento enviado"

#### 🏡 Comprovante de Endereço
- [ ] Clicar em "Enviar arquivo"
- [ ] Selecionar PDF ou imagem
- [ ] Ver checkmark verde "✓ Documento enviado"

#### 📘 Carteira de Trabalho Digital
- [ ] Clicar em "Enviar PDF"
- [ ] Selecionar PDF ou imagem
- [ ] Ver checkmark verde "✓ Documento enviado"

#### ❌ Validação: Documentos obrigatórios
```
Ação: Tentar enviar sem todos os documentos
Resultado esperado: Alerta "Por favor, envie todos os documentos"
```

#### ✅ Envio completo
- [ ] Clicar em "Enviar Documentos" com todos os 4 documentos
- [ ] Ver loading
- [ ] Ver alerta "Sucesso! Documentos enviados com sucesso. Aguarde a análise."
- [ ] Clicar em "OK"
- [ ] Voltar para tela Welcome

---

### 6️⃣ Verificação no Supabase

#### Tabela `users`
Abra o Supabase Dashboard → Table Editor → users

Verificar se o registro foi criado com:
- [ ] cpf = "12345678901"
- [ ] nome = "João da Silva Teste"
- [ ] telefone = "11987654321"
- [ ] email = "joao.teste@email.com"
- [ ] rg = "123456789" (se preenchido)
- [ ] data_nascimento = "1990-12-25" (se preenchido)
- [ ] contato_emergencia = "11912345678" (se preenchido)
- [ ] status = "pendente"

#### Tabela `documents`
Verificar se o registro foi criado com:
- [ ] id_user = (ID do usuário criado)
- [ ] selfie_url = (URL válida)
- [ ] cnh_rg_url = (URL válida)
- [ ] comprovante_endereco_url = (URL válida)
- [ ] comprovante_renda_url = NULL
- [ ] carteira_trabalho_pdf_url = (URL válida)
- [ ] status_documentos = "em_analise"

#### Storage `user-documents`
Verificar se os arquivos foram salvos em:
- [ ] /selfies/
- [ ] /cnh/
- [ ] /comprovantes-endereco/
- [ ] /carteiras-trabalho/

---

### 7️⃣ Testes Adicionais

#### ❌ CPF Duplicado
```
Ação: Tentar cadastrar novamente com mesmo CPF
Resultado esperado: Alerta "CPF já cadastrado"
```

#### ✅ Scroll do formulário
```
Ação: Rolar o formulário de registro
Resultado esperado: Conseguir ver todos os campos
```

#### ✅ Navegação
```
Ação: Clicar na seta de voltar (←)
Resultado esperado: Voltar para tela Welcome
```

---

## 📊 Resultado Esperado

### ✅ Tudo Funcionando:
- Todos os checkboxes marcados
- Usuário criado no Supabase
- Documentos salvos no Storage
- Interface responsiva
- Validações funcionando
- Formatação automática
- Redirecionamento correto

### ❌ Se algo não funcionar:

1. **Erro na migração SQL**
   - Verifique se executou o SQL no Supabase
   - Confirme que as colunas foram criadas

2. **Erro ao criar usuário**
   - Verifique conexão com Supabase
   - Verifique se as variáveis de ambiente estão corretas
   - Veja logs no console: `npx expo start`

3. **Erro no upload de documentos**
   - Verifique permissões do Storage no Supabase
   - Verifique se o bucket "user-documents" existe
   - Veja logs no console

4. **Interface não aparece correta**
   - Force reload: Shake device → Reload
   - Limpe cache: `npx expo start -c`

---

## 🎯 Critérios de Sucesso

Para considerar o teste bem-sucedido:

```
✅ Formulário exibe todos os 7 campos
✅ Validações funcionam corretamente
✅ Formatação automática funciona
✅ Cadastro salva no Supabase
✅ Redireciona para documentos automaticamente
✅ Upload de 4 documentos funciona
✅ Documentos salvos no Storage
✅ Interface responsiva com scroll
✅ Mensagens de erro/sucesso adequadas
✅ Não há comprovante de renda
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do app: `npx expo start`
2. Verifique logs do Supabase Dashboard
3. Releia os documentos:
   - `REGISTRO_COMPLETO.md` - Documentação completa
   - `RESUMO_REGISTRO.md` - Resumo visual

---

**Boa sorte com os testes!** 🚀
