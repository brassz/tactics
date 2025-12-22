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

-- Criar índices para melhor performance
CREATE INDEX idx_capturas_user ON capturas_faciais(id_user);
CREATE INDEX idx_capturas_tipo ON capturas_faciais(tipo_operacao);
CREATE INDEX idx_capturas_solicitacao ON capturas_faciais(id_solicitacao);
CREATE INDEX idx_capturas_pagamento ON capturas_faciais(id_pagamento);
CREATE INDEX idx_capturas_created ON capturas_faciais(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE capturas_faciais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Enable all access for capturas_faciais" ON capturas_faciais FOR ALL USING (true);

-- Comentários na tabela
COMMENT ON TABLE capturas_faciais IS 'Armazena capturas faciais realizadas durante operações sensíveis';
COMMENT ON COLUMN capturas_faciais.tipo_operacao IS 'Tipo de operação: solicitacao_valor, pagamento, login';
COMMENT ON COLUMN capturas_faciais.metadata IS 'Dados adicionais da captura (localização, device info, etc)';

