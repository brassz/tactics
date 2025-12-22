# Implementação de Funcionalidades de Segurança

## ✅ Funcionalidades Implementadas

### 1. Autenticação Biométrica no Login
- **Face ID / Touch ID / PIN do dispositivo**
- Solicita autenticação biométrica sempre que o usuário tenta fazer login
- Funciona tanto para clientes quanto para administradores
- Feedback visual do status de autenticação

### 2. Captura Facial em Solicitações de Valores
- Captura facial obrigatória ao solicitar valores
- Imagem é salva no Supabase Storage
- Registro vinculado à solicitação na tabela `capturas_faciais`
- Interface intuitiva com guia visual para posicionamento

### 3. Captura Facial em Pagamentos
- Captura facial obrigatória ao realizar pagamentos
- Imagem é salva no Supabase Storage
- Registro vinculado ao pagamento na tabela `capturas_faciais`
- Confirmação de identidade antes de processar pagamento

### 4. Visualização de Documentos pelo Admin
- Admin pode visualizar todos os documentos dos clientes
- Disponível no painel web e no app mobile
- Preview de imagens e download de PDFs
- Sistema de aprovação/reprovação de documentos

## 📋 Estrutura do Banco de Dados

### Nova Tabela: capturas_faciais

```sql
CREATE TABLE capturas_faciais (
  id UUID PRIMARY KEY,
  id_user UUID REFERENCES users(id),
  tipo_operacao VARCHAR(50) -- 'solicitacao_valor', 'pagamento', 'login'
  imagem_url TEXT NOT NULL,
  id_solicitacao UUID REFERENCES solicitacoes_valores(id),
  id_pagamento UUID REFERENCES pagamentos(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Como Configurar

### 1. Executar Migration do Banco de Dados

Execute o arquivo SQL no Supabase:
```bash
supabase/migration-facial-captures.sql
```

Ou copie e execute manualmente no SQL Editor do Supabase Dashboard.

### 2. Configurar Storage no Supabase

Certifique-se de que o bucket `user-documents` existe e tem as políticas corretas:

```sql
-- Política de upload para usuários autenticados
CREATE POLICY "Usuários podem fazer upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

-- Política de leitura pública
CREATE POLICY "Leitura pública de documentos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-documents');
```

### 3. Instalar Dependências

As dependências já foram instaladas, mas se precisar reinstalar:

```bash
cd mobile
npm install
```

### 4. Testar o App

```bash
cd mobile
npm start
```

## 📱 Fluxo de Uso

### Login com Autenticação Biométrica

1. Usuário abre o app e vai para tela de login
2. Insere o CPF
3. Sistema detecta se há biometria disponível no dispositivo
4. Solicita autenticação biométrica (Face ID/Touch ID/PIN)
5. Após autenticação bem-sucedida, permite o login

### Solicitação de Valor com Captura Facial

1. Usuário preenche valor e justificativa
2. Clica em "Enviar Solicitação"
3. Sistema mostra alerta explicando a necessidade de captura facial
4. Abre câmera frontal com guia de posicionamento
5. Usuário tira foto do rosto
6. Confirma a captura
7. Sistema faz upload da imagem e cria a solicitação
8. Captura facial fica vinculada à solicitação

### Pagamento com Captura Facial

1. Usuário visualiza pagamentos pendentes
2. Clica em "Pagar Agora" em uma parcela
3. Sistema mostra confirmação com necessidade de captura facial
4. Abre câmera frontal com guia de posicionamento
5. Usuário tira foto do rosto
6. Confirma a captura
7. Sistema processa pagamento e atualiza status
8. Captura facial fica vinculada ao pagamento

## 🔒 Segurança Implementada

### Autenticação Biométrica
- Usa APIs nativas do sistema operacional (iOS/Android)
- Não armazena dados biométricos no app
- Apenas valida se a autenticação foi bem-sucedida

### Armazenamento de Capturas Faciais
- Imagens armazenadas no Supabase Storage
- URLs públicas mas difíceis de adivinhar
- Vinculadas a operações específicas (solicitações, pagamentos)
- Metadata adicional para rastreabilidade

### Auditoria
- Todas as capturas faciais são registradas
- Timestamp de cada operação
- Possibilidade de consultar histórico completo
- Vinculação com operações financeiras

## 📊 Consultas Úteis

### Ver todas as capturas faciais de um usuário

```sql
SELECT 
  cf.*,
  u.nome,
  u.cpf
FROM capturas_faciais cf
JOIN users u ON cf.id_user = u.id
WHERE cf.id_user = 'USER_ID_AQUI'
ORDER BY cf.created_at DESC;
```

### Ver capturas por tipo de operação

```sql
SELECT 
  tipo_operacao,
  COUNT(*) as total,
  DATE(created_at) as data
FROM capturas_faciais
GROUP BY tipo_operacao, DATE(created_at)
ORDER BY created_at DESC;
```

### Ver solicitações com suas capturas faciais

```sql
SELECT 
  sv.*,
  u.nome,
  cf.imagem_url as captura_facial,
  cf.created_at as data_captura
FROM solicitacoes_valores sv
JOIN users u ON sv.id_user = u.id
LEFT JOIN capturas_faciais cf ON cf.id_solicitacao = sv.id
WHERE sv.status = 'aguardando'
ORDER BY sv.created_at DESC;
```

## 🎨 Componentes Criados

### FacialCaptureModal
Componente reutilizável para captura facial:
- Interface intuitiva com preview
- Guia visual para posicionamento
- Opção de tirar foto novamente
- Feedback de loading durante upload
- Tratamento de erros

**Localização:** `mobile/components/FacialCaptureModal.js`

**Uso:**
```jsx
<FacialCaptureModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onCapture={(imageUri) => handleCapture(imageUri)}
  title="Captura Facial"
/>
```

## 🔧 Manutenção

### Adicionar novo tipo de operação que requer captura facial

1. Adicione o novo tipo no CHECK constraint da tabela:
```sql
ALTER TABLE capturas_faciais 
DROP CONSTRAINT IF EXISTS capturas_faciais_tipo_operacao_check;

ALTER TABLE capturas_faciais 
ADD CONSTRAINT capturas_faciais_tipo_operacao_check 
CHECK (tipo_operacao IN ('solicitacao_valor', 'pagamento', 'login', 'NOVO_TIPO'));
```

2. Adicione referência na tabela se necessário:
```sql
ALTER TABLE capturas_faciais
ADD COLUMN id_nova_operacao UUID REFERENCES nova_tabela(id) ON DELETE SET NULL;
```

3. Use o componente `FacialCaptureModal` na tela correspondente

## ⚠️ Observações Importantes

1. **Permissões de Câmera**: O app solicita permissão de câmera automaticamente
2. **Biometria Opcional**: Se o dispositivo não tem biometria, permite login sem ela
3. **Capturas Obrigatórias**: Não é possível fazer solicitações ou pagamentos sem captura facial
4. **Storage**: Certifique-se de que há espaço suficiente no bucket do Supabase
5. **Qualidade de Imagem**: As imagens são comprimidas para otimizar armazenamento

## 📞 Suporte

Em caso de problemas:
1. Verifique se o SQL da migration foi executado
2. Confirme as permissões de storage no Supabase
3. Verifique os logs do console para erros específicos
4. Teste em um dispositivo físico (emulador pode ter limitações de câmera)

## 🎯 Próximos Passos Sugeridos

1. ✅ Adicionar reconhecimento facial (verificar se é a mesma pessoa)
2. ✅ Adicionar geolocalização nas capturas
3. ✅ Notificações push para operações sensíveis
4. ✅ Dashboard de auditoria de segurança no painel admin
5. ✅ Relatórios de atividades suspeitas

