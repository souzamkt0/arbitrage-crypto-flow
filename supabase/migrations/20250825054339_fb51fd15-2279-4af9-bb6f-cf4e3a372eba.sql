-- Sistema de pagamentos USDT - Corrigindo policies existentes

-- Remover policy existente e recriar
DROP POLICY IF EXISTS "Anyone can view supported currencies" ON supported_currencies;

-- Atualizar tabela de transações para suportar USDT
ALTER TABLE bnb20_transactions 
ADD COLUMN IF NOT EXISTS pay_currency_variant TEXT DEFAULT 'TRC20';

-- Adicionar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_status ON bnb20_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_user_id ON bnb20_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_payment_id ON bnb20_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_created_at ON bnb20_transactions(created_at);

-- Criar tabela supported_currencies se não existir
CREATE TABLE IF NOT EXISTS supported_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  network TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_amount NUMERIC DEFAULT 1.0,
  max_amount NUMERIC DEFAULT 10000.0,
  confirmation_blocks INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS se não estiver habilitado
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

-- Recriar policies
CREATE POLICY "Public can view supported currencies"
ON supported_currencies FOR SELECT
USING (true);

CREATE POLICY "Admins can manage supported currencies"
ON supported_currencies FOR ALL
USING (is_admin(auth.uid()));

-- Inserir moedas USDT suportadas (se não existirem)
INSERT INTO supported_currencies (symbol, name, network, min_amount, max_amount, confirmation_blocks)
VALUES 
  ('usdt', 'Tether USD', 'TRC20', 1.0, 50000.0, 1),
  ('usdt', 'Tether USD', 'ERC20', 1.0, 50000.0, 12),
  ('usdt', 'Tether USD', 'BSC', 1.0, 50000.0, 3),
  ('bnb', 'BNB', 'BSC', 0.001, 1000.0, 3)
ON CONFLICT DO NOTHING;