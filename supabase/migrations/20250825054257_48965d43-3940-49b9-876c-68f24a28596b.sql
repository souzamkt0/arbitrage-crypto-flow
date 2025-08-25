-- Sistema completo de pagamentos USDT com NOWPayments
-- Criar tabelas para suporte a múltiplas criptomoedas

-- Atualizar tabela de transações para suportar USDT
ALTER TABLE bnb20_transactions 
ADD COLUMN IF NOT EXISTS pay_currency_variant TEXT DEFAULT 'TRC20';

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_status ON bnb20_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_user_id ON bnb20_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_payment_id ON bnb20_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_created_at ON bnb20_transactions(created_at);

-- Tabela de configuração de moedas suportadas
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

-- RLS para supported_currencies
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view supported currencies"
ON supported_currencies FOR SELECT
USING (true);

CREATE POLICY "Admins can manage supported currencies"
ON supported_currencies FOR ALL
USING (is_admin(auth.uid()));

-- Inserir moedas USDT suportadas
INSERT INTO supported_currencies (symbol, name, network, min_amount, max_amount, confirmation_blocks)
VALUES 
  ('usdt', 'Tether USD', 'TRC20', 1.0, 50000.0, 1),
  ('usdt', 'Tether USD', 'ERC20', 1.0, 50000.0, 12),
  ('usdt', 'Tether USD', 'BSC', 1.0, 50000.0, 3),
  ('bnb', 'BNB', 'BSC', 0.001, 1000.0, 3)
ON CONFLICT DO NOTHING;

-- Tabela de estatísticas de pagamentos
CREATE TABLE IF NOT EXISTS payment_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  avg_processing_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, currency, network)
);

-- RLS para payment_stats
ALTER TABLE payment_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment stats"
ON payment_stats FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can manage payment stats"
ON payment_stats FOR ALL
USING (true);

-- Função para atualizar estatísticas
CREATE OR REPLACE FUNCTION update_payment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    INSERT INTO payment_stats (
      date, 
      currency, 
      network, 
      total_transactions, 
      total_volume, 
      successful_transactions
    )
    VALUES (
      CURRENT_DATE,
      COALESCE(NEW.pay_currency, 'usdt'),
      COALESCE(NEW.pay_currency_variant, 'TRC20'),
      1,
      NEW.amount_usd,
      1
    )
    ON CONFLICT (date, currency, network) 
    DO UPDATE SET
      total_transactions = payment_stats.total_transactions + 1,
      total_volume = payment_stats.total_volume + NEW.amount_usd,
      successful_transactions = payment_stats.successful_transactions + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas
DROP TRIGGER IF EXISTS update_payment_stats_trigger ON bnb20_transactions;
CREATE TRIGGER update_payment_stats_trigger
  AFTER UPDATE ON bnb20_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_stats();

-- Atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para timestamp automático
DROP TRIGGER IF EXISTS update_supported_currencies_updated_at ON supported_currencies;
CREATE TRIGGER update_supported_currencies_updated_at
    BEFORE UPDATE ON supported_currencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_stats_updated_at ON payment_stats;
CREATE TRIGGER update_payment_stats_updated_at
    BEFORE UPDATE ON payment_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();