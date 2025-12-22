# 🔐 Sistema de Segurança - Guia Completo

## 📖 Visão Geral

Este sistema financeiro mobile implementa múltiplas camadas de segurança para proteger as operações dos usuários:

1. **Autenticação Biométrica** - Face ID, Touch ID ou PIN do dispositivo
2. **Captura Facial Obrigatória** - Para solicitações de valores e pagamentos
3. **Auditoria Completa** - Todas as operações sensíveis são registradas
4. **Visualização Segura** - Admins podem visualizar documentos dos clientes

---

## 🚀 Início Rápido

### 1. Configurar Banco de Dados

Execute a migration no Supabase:

```sql
-- Execute o arquivo:
supabase/migration-facial-captures.sql
```

Ou use o schema completo atualizado:

```sql
-- Execute o arquivo:
supabase/schema.sql
```

### 2. Configurar Storage

No Supabase Dashboard:

1. Vá para **Storage**
2. Crie o bucket `user-documents` (se não existir)
3. Configure as políticas:

```sql
-- Permitir upload
CREATE POLICY "Usuários podem fazer upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

-- Permitir leitura
CREATE POLICY "Leitura pública de documentos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-documents');
```

### 3. Instalar Dependências

```bash
cd mobile
npm install
```

As seguintes dependências foram adicionadas:
- `expo-local-authentication` - Para biometria
- `expo-camera` - Para captura facial
- `expo-file-system` - Para manipulação de arquivos

### 4. Executar o App

```bash
cd mobile
npm start
```

**Importante:** Use um dispositivo físico para testar biometria. Emuladores têm limitações.

---

## 📱 Funcionalidades Implementadas

### 1. Autenticação Biométrica no Login

#### Como Funciona:
- Ao fazer login, o sistema verifica se o dispositivo tem biometria disponível
- Se disponível, solicita autenticação antes de permitir o acesso
- Suporta Face ID (iOS), Touch ID (iOS), impressão digital (Android) e PIN

#### Arquivo Principal:
```
mobile/screens/LoginScreen.js
```

#### Fluxo:
```
Usuário insere CPF
    ↓
Sistema verifica biometria disponível
    ↓
Solicita autenticação biométrica
    ↓
Se sucesso → Login permitido
Se falha → Mensagem de erro
```

---

### 2. Captura Facial em Solicitações

#### Como Funciona:
- Ao solicitar um valor, o usuário DEVE tirar uma selfie
- A foto é enviada para o Supabase Storage
- Um registro é criado na tabela `capturas_faciais` vinculado à solicitação

#### Arquivos Principais:
```
mobile/screens/RequestScreen.js
mobile/components/FacialCaptureModal.js
```

#### Fluxo:
```
Usuário preenche valor e justificativa
    ↓
Clica em "Enviar Solicitação"
    ↓
Sistema mostra alerta sobre captura facial
    ↓
Abre câmera frontal com guia de posicionamento
    ↓
Usuário tira foto e confirma
    ↓
Sistema faz upload da imagem
    ↓
Cria solicitação vinculada à captura
    ↓
Sucesso!
```

---

### 3. Captura Facial em Pagamentos

#### Como Funciona:
- Ao pagar uma parcela, o usuário DEVE tirar uma selfie
- A foto é enviada para o Supabase Storage
- Um registro é criado na tabela `capturas_faciais` vinculado ao pagamento
- Status do pagamento é atualizado para "pago"

#### Arquivo Principal:
```
mobile/screens/PaymentsScreen.js
```

#### Fluxo:
```
Usuário visualiza pagamentos pendentes
    ↓
Clica em "Pagar Agora"
    ↓
Sistema mostra confirmação
    ↓
Abre câmera frontal
    ↓
Usuário tira foto e confirma
    ↓
Sistema processa pagamento
    ↓
Atualiza status e salva captura
    ↓
Sucesso!
```

---

### 4. Visualização de Documentos pelo Admin

#### Painel Web:
```
admin-panel/app/dashboard/documents/page.tsx
```

Funcionalidades:
- Lista todos os documentos enviados
- Preview de imagens (selfie, RG/CNH)
- Download de PDFs (comprovantes)
- Aprovar/Reprovar documentos
- Filtros por status

#### App Mobile:
```
mobile/screens/AdminDocumentsScreen.js
```

Funcionalidades:
- Estatísticas (total, pendentes, aprovados, reprovados)
- Lista de documentos com informações do cliente
- Preview de imagens em tela cheia
- Gerenciamento de status
- Refresh para atualizar

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: capturas_faciais

```sql
CREATE TABLE capturas_faciais (
  id UUID PRIMARY KEY,
  id_user UUID REFERENCES users(id),
  tipo_operacao VARCHAR(50), -- 'solicitacao_valor', 'pagamento', 'login'
  imagem_url TEXT NOT NULL,
  id_solicitacao UUID REFERENCES solicitacoes_valores(id),
  id_pagamento UUID REFERENCES pagamentos(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relacionamentos:

```
users (1) ─── (N) capturas_faciais
solicitacoes_valores (1) ─── (N) capturas_faciais
pagamentos (1) ─── (N) capturas_faciais
```

### Consultas Úteis:

#### Ver todas as capturas de um usuário:
```sql
SELECT * FROM capturas_faciais 
WHERE id_user = 'USER_ID' 
ORDER BY created_at DESC;
```

#### Ver solicitações com capturas:
```sql
SELECT 
  sv.*,
  cf.imagem_url,
  cf.created_at as data_captura
FROM solicitacoes_valores sv
LEFT JOIN capturas_faciais cf ON cf.id_solicitacao = sv.id
WHERE sv.id_user = 'USER_ID';
```

#### Estatísticas de capturas:
```sql
SELECT 
  tipo_operacao,
  COUNT(*) as total,
  DATE(created_at) as data
FROM capturas_faciais
GROUP BY tipo_operacao, DATE(created_at)
ORDER BY data DESC;
```

---

## 🧪 Testes

### Verificar Configuração:

```bash
node verificar-seguranca.js
```

Este script verifica:
- ✅ Tabela `capturas_faciais` existe
- ✅ Bucket `user-documents` está configurado
- ✅ Usuários de teste existem
- ✅ Capturas faciais estão sendo salvas
- ✅ Relacionamentos funcionam

### Guia Completo de Testes:

Consulte o arquivo `GUIA_TESTE_SEGURANCA.md` para:
- Cenários de teste detalhados
- Resultados esperados
- Checklist de validação
- Problemas comuns e soluções

---

## 🔧 Componentes Criados

### FacialCaptureModal

Componente reutilizável para captura facial.

**Localização:** `mobile/components/FacialCaptureModal.js`

**Props:**
- `visible` (boolean) - Controla visibilidade do modal
- `onClose` (function) - Callback ao fechar
- `onCapture` (function) - Callback com a URI da imagem capturada
- `title` (string) - Título do modal

**Exemplo de Uso:**
```jsx
import FacialCaptureModal from '../components/FacialCaptureModal';

function MyScreen() {
  const [showModal, setShowModal] = useState(false);
  
  const handleCapture = async (imageUri) => {
    // Processar imagem
    console.log('Imagem capturada:', imageUri);
  };
  
  return (
    <FacialCaptureModal
      visible={showModal}
      onClose={() => setShowModal(false)}
      onCapture={handleCapture}
      title="Captura Facial"
    />
  );
}
```

---

## 📊 Auditoria e Compliance

### Dados Armazenados:

Para cada captura facial:
- ✅ ID do usuário
- ✅ Tipo de operação
- ✅ URL da imagem
- ✅ Timestamp
- ✅ Vinculação com operação (solicitação/pagamento)
- ✅ Metadata adicional (opcional)

### Rastreabilidade:

Todas as operações sensíveis podem ser rastreadas:

```sql
-- Histórico completo de um usuário
SELECT 
  'Solicitação' as tipo,
  sv.valor,
  sv.created_at,
  cf.imagem_url as captura
FROM solicitacoes_valores sv
LEFT JOIN capturas_faciais cf ON cf.id_solicitacao = sv.id
WHERE sv.id_user = 'USER_ID'

UNION ALL

SELECT 
  'Pagamento' as tipo,
  p.valor,
  p.data_pagamento,
  cf.imagem_url as captura
FROM pagamentos p
LEFT JOIN capturas_faciais cf ON cf.id_pagamento = p.id
WHERE p.id_user = 'USER_ID'

ORDER BY created_at DESC;
```

---

## 🛡️ Segurança e Privacidade

### Armazenamento de Imagens:
- Imagens são armazenadas no Supabase Storage
- URLs são públicas mas não listáveis
- Nomes de arquivo incluem UUID e timestamp (difíceis de adivinhar)

### Dados Biométricos:
- O app NÃO armazena dados biométricos
- Usa apenas APIs do sistema operacional
- Apenas valida se autenticação foi bem-sucedida

### LGPD/GDPR:
- Usuários devem ser informados sobre coleta de imagens
- Imagens são vinculadas a operações específicas (finalidade)
- Possibilidade de exclusão mediante solicitação

---

## 🚨 Troubleshooting

### Problema: Câmera não abre
**Solução:** Verifique permissões nas configurações do dispositivo

### Problema: Upload falha
**Solução:** Verifique políticas de storage no Supabase

### Problema: Biometria não funciona
**Solução:** 
- Verifique se o dispositivo tem biometria configurada
- Teste em dispositivo físico (não emulador)

### Problema: Imagens não aparecem
**Solução:** Verifique se as URLs públicas estão corretas

### Problema: Erro "Buffer is not defined"
**Solução:** Use base64 do expo-file-system ao invés de Buffer

---

## 📚 Documentação Adicional

- `IMPLEMENTACAO_SEGURANCA.md` - Detalhes técnicos da implementação
- `GUIA_TESTE_SEGURANCA.md` - Guia completo de testes
- `supabase/migration-facial-captures.sql` - Migration do banco
- `verificar-seguranca.js` - Script de verificação

---

## 🎯 Roadmap Futuro

Sugestões de melhorias:

1. **Reconhecimento Facial**
   - Verificar se a foto é da mesma pessoa do cadastro
   - Detectar fotos falsas (liveness detection)

2. **Geolocalização**
   - Registrar localização nas capturas
   - Detectar operações suspeitas por localização

3. **Notificações Push**
   - Alertar sobre operações realizadas
   - Confirmar operações via notificação

4. **Dashboard de Auditoria**
   - Visualização gráfica de operações
   - Alertas de atividades suspeitas
   - Relatórios automáticos

5. **Machine Learning**
   - Detectar padrões de fraude
   - Análise comportamental
   - Score de risco

---

## 💡 Boas Práticas

### Para Desenvolvedores:

1. **Sempre teste em dispositivo físico** para funcionalidades de biometria
2. **Trate erros adequadamente** - usuário pode negar permissões
3. **Forneça feedback visual** durante uploads
4. **Comprima imagens** para economizar storage
5. **Valide no backend** - nunca confie apenas no frontend

### Para Administradores:

1. **Monitore o storage** - imagens ocupam espaço
2. **Revise políticas de RLS** regularmente
3. **Faça backup** dos dados de auditoria
4. **Documente** processos de compliance
5. **Treine a equipe** sobre funcionalidades de segurança

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte a documentação completa
2. Execute o script de verificação
3. Revise os logs do console
4. Verifique as configurações do Supabase

---

## ✅ Checklist de Implementação

- [x] Autenticação biométrica no login
- [x] Captura facial em solicitações
- [x] Captura facial em pagamentos
- [x] Visualização de documentos pelo admin (web)
- [x] Visualização de documentos pelo admin (mobile)
- [x] Tabela de capturas faciais
- [x] Storage configurado
- [x] Componente reutilizável de captura
- [x] Testes documentados
- [x] Script de verificação
- [x] Documentação completa

---

**Sistema implementado com sucesso! 🎉**

Para começar a usar, siga o guia de início rápido acima.

