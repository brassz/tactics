-- Sistema Financeiro - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (clientes)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  data_cadastro TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de administradores
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  selfie_url TEXT,
  cnh_rg_url TEXT,
  comprovante_endereco_url TEXT,
  comprovante_renda_url TEXT,
  carteira_trabalho_pdf_url TEXT,
  status_documentos VARCHAR(20) DEFAULT 'pendente' CHECK (status_documentos IN ('pendente', 'aprovado', 'reprovado', 'em_analise')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de solicitações de valores
CREATE TABLE solicitacoes_valores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  justificativa TEXT,
  status VARCHAR(20) DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'aprovado', 'negado', 'em_analise')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  id_solicitacao UUID REFERENCES solicitacoes_valores(id) ON DELETE SET NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chat
CREATE TABLE chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID REFERENCES users(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  remetente VARCHAR(20) CHECK (remetente IN ('cliente', 'admin')),
  arquivo_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE
);

-- Criar índices para melhor performance
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_documents_user ON documents(id_user);
CREATE INDEX idx_solicitacoes_user ON solicitacoes_valores(id_user);
CREATE INDEX idx_solicitacoes_status ON solicitacoes_valores(status);
CREATE INDEX idx_pagamentos_user ON pagamentos(id_user);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_chat_user ON chat(id_user);
CREATE INDEX idx_chat_timestamp ON chat(timestamp);

-- Criar Storage Buckets (executar no Dashboard do Supabase)
-- Bucket: user-documents
-- Bucket: chat-files

-- Insert admin padrão (CPF: 00000000000)
INSERT INTO admins (cpf, nome) VALUES ('00000000000', 'Administrador Master');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso público para simplificar - ajustar conforme necessário)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable all access for documents" ON documents FOR ALL USING (true);
CREATE POLICY "Enable all access for solicitacoes" ON solicitacoes_valores FOR ALL USING (true);
CREATE POLICY "Enable all access for pagamentos" ON pagamentos FOR ALL USING (true);
CREATE POLICY "Enable all access for chat" ON chat FOR ALL USING (true);
CREATE POLICY "Enable read access for admins" ON admins FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitacoes_updated_at BEFORE UPDATE ON solicitacoes_valores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
