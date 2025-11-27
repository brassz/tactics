# Guia do Painel Administrativo Completo

## 📋 Visão Geral

Este painel administrativo oferece controle total sobre cadastros, documentos, solicitações, pagamentos e cobranças de clientes, com integração completa com WhatsApp.

## 🚀 Recursos Implementados

### 1. **Gerenciamento de Cadastros** (`/dashboard`)
- ✅ Visualizar todos os cadastros de clientes
- ✅ Aprovar/reprovar cadastros
- ✅ Editar telefone e e-mail dos clientes
- ✅ Enviar mensagens via WhatsApp direto para clientes
- ✅ Estatísticas de cadastros (total, pendentes, aprovados, reprovados)
- ✅ Filtros por status

### 2. **Gerenciamento de Documentos** (`/dashboard/documents`)
- ✅ Visualizar documentos enviados pelos clientes
- ✅ Aprovar/reprovar documentos
- ✅ Marcar documentos como "Em Análise"
- ✅ Visualizar imagens de documentos
- ✅ Download de PDFs

### 3. **Gerenciamento de Solicitações** (`/dashboard/requests`)
- ✅ Visualizar todas as solicitações de valores
- ✅ Aprovar/negar solicitações
- ✅ Marcar como "Em Análise"
- ✅ Visualizar justificativas dos clientes
- ✅ Estatísticas e filtros por status

### 4. **Controle de Pagamentos** (`/dashboard/payments`)
- ✅ Criar novos pagamentos para clientes
- ✅ Marcar pagamentos como pagos
- ✅ Enviar lembretes via WhatsApp
- ✅ Visualizar histórico de pagamentos
- ✅ Estatísticas financeiras (total, pendente, recebido)

### 5. **Sistema de Cobranças** 🆕 (`/dashboard/charges`)
- ✅ Criar cobranças personalizadas
- ✅ Adicionar descrição detalhada da cobrança
- ✅ Incluir link de pagamento (Pix, boleto, etc.)
- ✅ Enviar cobranças via WhatsApp automaticamente
- ✅ Rastreamento de envios (marca quando foi enviado)
- ✅ Gerenciar status (pendente, pago, atrasado, cancelado)
- ✅ Filtros por status
- ✅ Estatísticas completas

### 6. **Chat/Suporte** (`/dashboard/chat`)
- ✅ Sistema de chat com clientes
- ✅ Envio de mensagens
- ✅ Upload de arquivos

## 🔧 Integração WhatsApp

### Como Funciona

Todas as funcionalidades de WhatsApp abrem o WhatsApp Web/App com mensagens pré-formatadas:

1. **Cadastros**: Envie mensagens personalizadas para clientes
2. **Pagamentos**: Envie lembretes de pagamentos pendentes
3. **Cobranças**: Envie cobranças completas com valor, descrição e link de pagamento

### Formato das Mensagens

#### Cobrança via WhatsApp
```
Olá [Nome]! 👋

Você possui uma cobrança pendente:

📋 Descrição: [Descrição da cobrança]
💰 Valor: R$ [Valor]
📅 Vencimento: [Data]

🔗 Link de pagamento:
[Link se fornecido]

Por favor, realize o pagamento até a data de vencimento.

Em caso de dúvidas, entre em contato conosco! 📱
```

## 📊 Banco de Dados

### Novas Tabelas

#### `cobrancas`
```sql
- id (UUID)
- id_user (FK para users)
- valor (DECIMAL)
- descricao (TEXT)
- data_vencimento (DATE)
- status (pendente/pago/cancelado/atrasado)
- link_pagamento (TEXT, opcional)
- mensagem_whatsapp (TEXT)
- enviado_whatsapp (BOOLEAN)
- data_envio_whatsapp (TIMESTAMP)
- created_at, updated_at
```

### Campos Adicionados

#### `users`
```sql
- telefone (VARCHAR(20)) - Para integração WhatsApp
- email (VARCHAR(255)) - Para contato por e-mail
```

## 🔄 Migração

Para atualizar seu banco de dados existente, execute o arquivo:
```
/workspace/supabase/migration-add-charges.sql
```

Este arquivo adiciona:
- Campos telefone e email na tabela users
- Tabela cobrancas completa
- Índices para performance
- Políticas RLS
- Triggers

## 🎨 Interface

### Design
- ✅ Interface moderna e responsiva
- ✅ Funciona em desktop e mobile
- ✅ Ícones intuitivos (Lucide React)
- ✅ Cores consistentes e acessíveis
- ✅ Feedback visual para todas as ações

### Componentes
- Modal para criação de cobranças/pagamentos
- Tabelas responsivas com scroll horizontal
- Cards com estatísticas
- Badges de status coloridos
- Botões de ação contextuais

## 🔐 Acesso

### Login Admin
- Acesse: `/` (página inicial do admin-panel)
- CPF padrão: `00000000000`
- Usuário: Administrador Master

## 📱 Requisitos para WhatsApp

Para que a integração com WhatsApp funcione:

1. **Clientes devem ter telefone cadastrado**
   - Formato: `11999999999` (DDD + número)
   - Edite o telefone na página de Cadastros

2. **WhatsApp Web/App instalado**
   - A integração abre o WhatsApp Web
   - Funciona em desktop e mobile

3. **Código do país**
   - Atualmente configurado para Brasil (+55)
   - Pode ser alterado no código se necessário

## 🚀 Próximos Passos

1. **Execute a migração do banco de dados**
   ```bash
   # No Supabase SQL Editor, cole o conteúdo de:
   /workspace/supabase/migration-add-charges.sql
   ```

2. **Adicione telefones aos clientes**
   - Vá em Cadastros
   - Clique no ícone de editar (lápis)
   - Adicione telefone e e-mail

3. **Teste as cobranças**
   - Crie uma nova cobrança
   - Adicione link de pagamento (opcional)
   - Envie via WhatsApp

4. **Configure o ambiente**
   - Certifique-se de ter as variáveis de ambiente configuradas
   - Verifique `.env` no admin-panel

## 📝 Comandos Úteis

### Iniciar Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```

### Iniciar Mobile App
```bash
cd mobile
npm install
npm start
```

## 🎯 Funcionalidades Principais

### Fluxo de Cobrança Completo
1. Admin cria cobrança com valor e descrição
2. Adiciona link de pagamento (Pix, boleto, etc.)
3. Envia via WhatsApp com um clique
4. Sistema marca como enviado
5. Cliente recebe mensagem formatada
6. Admin marca como pago quando receber

### Fluxo de Aprovação
1. Cliente se cadastra no app mobile
2. Admin vê cadastro em "Pendente"
3. Admin aprova cadastro
4. Cliente envia documentos
5. Admin analisa e aprova documentos
6. Cliente pode fazer solicitações
7. Admin gerencia solicitações e pagamentos

## 🔍 Troubleshooting

### Erro de navegação no mobile?
✅ CORRIGIDO - O erro `navigation.reset()` foi resolvido

### WhatsApp não abre?
- Verifique se o telefone está no formato correto (sem caracteres especiais)
- Certifique-se de que o WhatsApp está instalado
- Teste com um número válido

### Tabela cobrancas não existe?
- Execute o arquivo de migração SQL
- Verifique se tem permissões no Supabase

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console (F12)
2. Consulte a documentação do Supabase
3. Teste em ambiente de desenvolvimento primeiro

---

**Desenvolvido com ❤️ para gestão completa de sistema financeiro**
