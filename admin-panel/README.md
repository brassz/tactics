# Sistema Financeiro - Admin Panel

Painel administrativo web para gerenciar o sistema financeiro.

## 🚀 Instalação

```bash
npm install
```

## 🖥️ Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 🔧 Configuração

Crie um arquivo `.env.local` com:

```
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

## 📋 Funcionalidades

### 1. Login
- Login com CPF de administrador
- CPF padrão: `00000000000`

### 2. Gerenciamento de Cadastros
- Visualizar todos os cadastros
- Aprovar ou reprovar usuários
- Estatísticas em tempo real

### 3. Documentos
- Visualizar documentos enviados
- Preview de imagens
- Download de PDFs
- Aprovar/reprovar documentos

### 4. Solicitações
- Gerenciar solicitações de valores
- Filtrar por status
- Aprovar ou negar solicitações
- Visualizar justificativas

### 5. Pagamentos
- Criar novos pagamentos
- Marcar pagamentos como pagos
- Controlar vencimentos
- Estatísticas financeiras

### 6. Chat ao Vivo
- Chat em tempo real com clientes
- Lista de clientes aprovados
- Histórico de mensagens
- Notificações de novas mensagens

## 🎨 Tecnologias

- Next.js 14
- TypeScript
- TailwindCSS
- Supabase
- Lucide React (ícones)

## 🔐 Acesso

**CPF Admin Padrão:** 00000000000

Para adicionar mais administradores, insira no banco:

```sql
INSERT INTO admins (cpf, nome) VALUES ('12345678901', 'Nome do Admin');
```

## 📱 Layout

Interface moderna e responsiva com:
- Sidebar navegável
- Design clean e profissional
- Cores azul, branco e cinza
- Estatísticas visuais
- Modais interativos
