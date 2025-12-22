# Guia de Teste - Funcionalidades de Segurança

## 📋 Pré-requisitos

1. ✅ Banco de dados configurado com a migration `migration-facial-captures.sql`
2. ✅ Bucket `user-documents` criado no Supabase Storage
3. ✅ App mobile instalado em um dispositivo físico (recomendado para biometria)
4. ✅ Usuário de teste cadastrado no sistema

## 🧪 Testes a Realizar

### 1. Teste de Autenticação Biométrica no Login

#### Cenário 1: Dispositivo com Biometria Disponível
**Passos:**
1. Abra o app mobile
2. Clique em "Entrar"
3. Digite um CPF válido (ex: 12345678901)
4. Clique em "Entrar"
5. Sistema deve solicitar autenticação biométrica (Face ID/Touch ID/PIN)

**Resultado Esperado:**
- ✅ Alerta de biometria aparece
- ✅ Após autenticação bem-sucedida, login é realizado
- ✅ Mensagem de sucesso é exibida

#### Cenário 2: Falha na Autenticação Biométrica
**Passos:**
1. Siga os passos do Cenário 1
2. Cancele ou falhe na autenticação biométrica

**Resultado Esperado:**
- ✅ Mensagem de erro é exibida
- ✅ Login não é realizado
- ✅ Usuário pode tentar novamente

#### Cenário 3: Dispositivo sem Biometria
**Passos:**
1. Use um dispositivo sem biometria configurada
2. Tente fazer login

**Resultado Esperado:**
- ✅ Login funciona normalmente sem solicitar biometria
- ✅ Não há mensagem de erro

---

### 2. Teste de Captura Facial em Solicitação de Valores

#### Cenário 1: Fluxo Completo de Solicitação
**Passos:**
1. Faça login no app como cliente
2. Vá para a aba "Solicitar"
3. Digite um valor (ex: 1000.00)
4. Digite uma justificativa (opcional)
5. Clique em "Enviar Solicitação"
6. Leia o alerta sobre captura facial
7. Clique em "Continuar"
8. Posicione o rosto na guia oval
9. Clique no botão de captura (círculo branco)
10. Revise a foto capturada
11. Clique em "Confirmar"

**Resultado Esperado:**
- ✅ Câmera frontal é aberta
- ✅ Guia oval aparece para posicionamento
- ✅ Foto é capturada com sucesso
- ✅ Preview da foto é exibido
- ✅ Upload é realizado (loading aparece)
- ✅ Solicitação é criada
- ✅ Mensagem de sucesso aparece
- ✅ Solicitação aparece no histórico

#### Cenário 2: Cancelar Captura Facial
**Passos:**
1. Siga os passos 1-7 do Cenário 1
2. Clique no X para fechar a câmera

**Resultado Esperado:**
- ✅ Câmera fecha
- ✅ Solicitação NÃO é criada
- ✅ Valores permanecem preenchidos no formulário

#### Cenário 3: Tirar Foto Novamente
**Passos:**
1. Siga os passos 1-10 do Cenário 1
2. Clique em "Tirar Novamente"
3. Tire uma nova foto
4. Confirme

**Resultado Esperado:**
- ✅ Volta para a câmera
- ✅ Nova foto pode ser tirada
- ✅ Nova foto substitui a anterior
- ✅ Processo continua normalmente

#### Verificação no Banco de Dados
```sql
-- Verificar se a captura foi salva
SELECT 
  cf.*,
  sv.valor,
  sv.justificativa,
  u.nome
FROM capturas_faciais cf
JOIN solicitacoes_valores sv ON cf.id_solicitacao = sv.id
JOIN users u ON cf.id_user = u.id
WHERE cf.tipo_operacao = 'solicitacao_valor'
ORDER BY cf.created_at DESC
LIMIT 5;
```

**Resultado Esperado:**
- ✅ Registro existe na tabela `capturas_faciais`
- ✅ `tipo_operacao` = 'solicitacao_valor'
- ✅ `imagem_url` contém URL válida
- ✅ `id_solicitacao` está preenchido
- ✅ `id_user` corresponde ao usuário logado

---

### 3. Teste de Captura Facial em Pagamentos

#### Cenário 1: Realizar Pagamento com Captura Facial
**Passos:**
1. Faça login no app como cliente
2. Vá para a aba "Pagamentos"
3. Localize um pagamento com status "Pendente" ou "Atrasado"
4. Clique no botão "Pagar Agora"
5. Leia o alerta de confirmação
6. Clique em "Confirmar"
7. Posicione o rosto na guia oval
8. Clique no botão de captura
9. Revise a foto
10. Clique em "Confirmar"

**Resultado Esperado:**
- ✅ Alerta de confirmação aparece
- ✅ Câmera frontal é aberta
- ✅ Foto é capturada
- ✅ Upload é realizado
- ✅ Status do pagamento muda para "Pago"
- ✅ Data de pagamento é registrada
- ✅ Mensagem de sucesso aparece
- ✅ Overlay de "Processando pagamento..." aparece durante o processo

#### Cenário 2: Cancelar Pagamento
**Passos:**
1. Siga os passos 1-4 do Cenário 1
2. Clique em "Cancelar" no alerta

**Resultado Esperado:**
- ✅ Alerta fecha
- ✅ Pagamento NÃO é processado
- ✅ Status permanece inalterado

#### Cenário 3: Tentar Pagar Parcela Já Paga
**Passos:**
1. Localize um pagamento com status "Pago"
2. Tente clicar nele

**Resultado Esperado:**
- ✅ Botão "Pagar Agora" não aparece
- ✅ Card não é clicável
- ✅ Data de pagamento é exibida

#### Verificação no Banco de Dados
```sql
-- Verificar se a captura e o pagamento foram registrados
SELECT 
  cf.*,
  p.valor,
  p.status,
  p.data_pagamento,
  u.nome
FROM capturas_faciais cf
JOIN pagamentos p ON cf.id_pagamento = p.id
JOIN users u ON cf.id_user = u.id
WHERE cf.tipo_operacao = 'pagamento'
ORDER BY cf.created_at DESC
LIMIT 5;
```

**Resultado Esperado:**
- ✅ Registro existe na tabela `capturas_faciais`
- ✅ `tipo_operacao` = 'pagamento'
- ✅ `imagem_url` contém URL válida
- ✅ `id_pagamento` está preenchido
- ✅ Status do pagamento = 'pago'
- ✅ `data_pagamento` está preenchida

---

### 4. Teste de Visualização de Documentos pelo Admin

#### Cenário 1: Admin Visualiza Documentos no Painel Web
**Passos:**
1. Acesse o painel admin web
2. Faça login como admin
3. Vá para a seção "Documentos"
4. Localize um cliente com documentos enviados
5. Clique nos botões de visualização (ícone de olho)
6. Clique nos botões de download (ícone de download)

**Resultado Esperado:**
- ✅ Lista de documentos é carregada
- ✅ Informações do cliente são exibidas (nome, CPF)
- ✅ Status dos documentos é exibido
- ✅ Selfie e RG/CNH abrem em modal de preview
- ✅ Outros documentos abrem em nova aba para download
- ✅ Modal de gerenciamento permite aprovar/reprovar

#### Cenário 2: Admin Visualiza Documentos no App Mobile
**Passos:**
1. Faça login no app mobile como admin
2. Acesse "Documentos" no menu
3. Visualize a lista de documentos
4. Clique em um documento
5. Clique em "Gerenciar Documentos"
6. Visualize os previews das imagens
7. Aprove ou reprove o documento

**Resultado Esperado:**
- ✅ Estatísticas são exibidas (Total, Pendentes, Aprovados, Reprovados)
- ✅ Cards dos documentos mostram informações completas
- ✅ Botões de visualização funcionam
- ✅ Modal de gerenciamento abre
- ✅ Previews de selfie e CNH são exibidos
- ✅ Ações de aprovar/reprovar funcionam
- ✅ Status é atualizado no banco

---

### 5. Testes de Permissões e Erros

#### Cenário 1: Permissão de Câmera Negada
**Passos:**
1. Negue a permissão de câmera quando solicitada
2. Tente fazer uma solicitação de valor

**Resultado Esperado:**
- ✅ Alerta de erro aparece
- ✅ Mensagem explica que permissão é necessária
- ✅ Modal de captura fecha automaticamente

#### Cenário 2: Erro de Upload
**Passos:**
1. Desconecte a internet
2. Tente fazer uma solicitação com captura facial
3. Tire a foto e confirme

**Resultado Esperado:**
- ✅ Erro de upload é capturado
- ✅ Mensagem de erro é exibida
- ✅ Solicitação NÃO é criada
- ✅ Usuário pode tentar novamente

#### Cenário 3: Timeout de Rede
**Passos:**
1. Use uma conexão muito lenta
2. Tente fazer upload de captura facial

**Resultado Esperado:**
- ✅ Loading é exibido durante todo o processo
- ✅ Timeout é tratado adequadamente
- ✅ Mensagem de erro apropriada é exibida

---

## 📊 Checklist de Validação Final

### Funcionalidades Básicas
- [ ] Login com biometria funciona
- [ ] Login sem biometria funciona (fallback)
- [ ] Captura facial em solicitações funciona
- [ ] Captura facial em pagamentos funciona
- [ ] Admin visualiza documentos no web
- [ ] Admin visualiza documentos no mobile

### Banco de Dados
- [ ] Tabela `capturas_faciais` existe
- [ ] Índices estão criados
- [ ] Políticas RLS estão ativas
- [ ] Registros são salvos corretamente
- [ ] Relacionamentos funcionam (foreign keys)

### Storage
- [ ] Bucket `user-documents` existe
- [ ] Políticas de upload funcionam
- [ ] Políticas de leitura funcionam
- [ ] URLs públicas são geradas
- [ ] Imagens são acessíveis

### UX/UI
- [ ] Interface de captura é intuitiva
- [ ] Guia de posicionamento ajuda o usuário
- [ ] Feedback visual durante upload
- [ ] Mensagens de erro são claras
- [ ] Loading states são exibidos

### Segurança
- [ ] Capturas faciais são obrigatórias
- [ ] Não é possível burlar a captura
- [ ] Imagens são vinculadas às operações
- [ ] Metadata é salva corretamente
- [ ] Auditoria é possível

### Performance
- [ ] Upload de imagens é rápido
- [ ] Compressão de imagens funciona
- [ ] App não trava durante captura
- [ ] Memória é liberada após upload

---

## 🐛 Problemas Comuns e Soluções

### Problema: Câmera não abre
**Solução:** Verifique se a permissão foi concedida nas configurações do dispositivo

### Problema: Upload falha sempre
**Solução:** Verifique as políticas de storage no Supabase

### Problema: Biometria não é solicitada
**Solução:** Verifique se o dispositivo tem biometria configurada

### Problema: Imagem não aparece no preview
**Solução:** Verifique se a URL pública está correta e acessível

### Problema: Erro "Buffer is not defined"
**Solução:** Use `decode` do expo-file-system ao invés de Buffer

---

## 📝 Relatório de Teste

Após realizar todos os testes, preencha:

**Data do Teste:** __________

**Dispositivo:** __________

**Versão do App:** __________

**Testes Realizados:** ___/___

**Testes Bem-Sucedidos:** ___/___

**Bugs Encontrados:** __________

**Observações:** __________

---

## ✅ Conclusão

Todos os testes devem passar antes de considerar a implementação completa. Se algum teste falhar, revise o código e a configuração correspondente.

