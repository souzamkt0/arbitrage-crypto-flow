-- Criar tabela para dados de trading em tempo real por plano
CREATE TABLE IF NOT EXISTS plan_trading_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  pair VARCHAR(20) NOT NULL,
  buy_price DECIMAL(18,8) NOT NULL,
  sell_price DECIMAL(18,8) NOT NULL,
  volume DECIMAL(18,8) NOT NULL,
  profit_percentage DECIMAL(5,4) NOT NULL,
  exchange_from VARCHAR(50) NOT NULL,
  exchange_to VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de preços por plano
CREATE TABLE IF NOT EXISTS plan_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  pair VARCHAR(20) NOT NULL,
  exchange VARCHAR(50) NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  volume DECIMAL(18,8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para operações de arbitragem por plano
CREATE TABLE IF NOT EXISTS plan_arbitrage_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  operation_id VARCHAR(100) NOT NULL,
  pair VARCHAR(20) NOT NULL,
  buy_exchange VARCHAR(50) NOT NULL,
  sell_exchange VARCHAR(50) NOT NULL,
  buy_price DECIMAL(18,8) NOT NULL,
  sell_price DECIMAL(18,8) NOT NULL,
  volume DECIMAL(18,8) NOT NULL,
  profit_amount DECIMAL(18,8) NOT NULL,
  profit_percentage DECIMAL(5,4) NOT NULL,
  execution_time INTEGER NOT NULL, -- em segundos
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para estatísticas de trading por plano
CREATE TABLE IF NOT EXISTS plan_trading_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL UNIQUE,
  total_operations INTEGER DEFAULT 0,
  total_profit DECIMAL(18,8) DEFAULT 0,
  avg_profit_percentage DECIMAL(5,4) DEFAULT 0,
  best_profit_percentage DECIMAL(5,4) DEFAULT 0,
  total_volume DECIMAL(18,8) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  avg_execution_time INTEGER DEFAULT 0,
  last_operation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE plan_trading_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_arbitrage_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_trading_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir leitura pública dos dados de trading
CREATE POLICY "Anyone can view plan trading data" ON plan_trading_data
FOR SELECT USING (true);

CREATE POLICY "Anyone can view plan price history" ON plan_price_history
FOR SELECT USING (true);

CREATE POLICY "Anyone can view plan arbitrage operations" ON plan_arbitrage_operations
FOR SELECT USING (true);

CREATE POLICY "Anyone can view plan trading stats" ON plan_trading_stats
FOR SELECT USING (true);

-- Políticas para inserção/atualização pelo sistema
CREATE POLICY "System can insert plan trading data" ON plan_trading_data
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert plan price history" ON plan_price_history
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert plan arbitrage operations" ON plan_arbitrage_operations
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert/update plan trading stats" ON plan_trading_stats
FOR ALL WITH CHECK (true);

-- Criar função para atualizar estatísticas
CREATE OR REPLACE FUNCTION update_plan_trading_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO plan_trading_stats (
    plan_id,
    total_operations,
    total_profit,
    avg_profit_percentage,
    best_profit_percentage,
    total_volume,
    avg_execution_time,
    last_operation_at
  )
  VALUES (
    NEW.plan_id,
    1,
    NEW.profit_amount,
    NEW.profit_percentage,
    NEW.profit_percentage,
    NEW.volume,
    NEW.execution_time,
    NEW.completed_at
  )
  ON CONFLICT (plan_id) DO UPDATE SET
    total_operations = plan_trading_stats.total_operations + 1,
    total_profit = plan_trading_stats.total_profit + NEW.profit_amount,
    avg_profit_percentage = (plan_trading_stats.avg_profit_percentage * plan_trading_stats.total_operations + NEW.profit_percentage) / (plan_trading_stats.total_operations + 1),
    best_profit_percentage = GREATEST(plan_trading_stats.best_profit_percentage, NEW.profit_percentage),
    total_volume = plan_trading_stats.total_volume + NEW.volume,
    avg_execution_time = (plan_trading_stats.avg_execution_time * plan_trading_stats.total_operations + NEW.execution_time) / (plan_trading_stats.total_operations + 1),
    last_operation_at = NEW.completed_at,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estatísticas automaticamente
CREATE TRIGGER update_plan_trading_stats_trigger
AFTER INSERT ON plan_arbitrage_operations
FOR EACH ROW EXECUTE FUNCTION update_plan_trading_stats();

-- Inserir dados iniciais para os planos existentes
INSERT INTO plan_trading_stats (plan_id, total_operations, total_profit, avg_profit_percentage, best_profit_percentage, total_volume, success_rate, avg_execution_time)
SELECT 
  id as plan_id,
  FLOOR(RANDOM() * 50 + 20) as total_operations,
  RANDOM() * 10000 + 1000 as total_profit,
  daily_rate / 4 as avg_profit_percentage, -- Aproximadamente 1/4 da taxa diária por operação
  daily_rate / 2 as best_profit_percentage, -- Melhor operação com metade da taxa diária
  RANDOM() * 100000 + 50000 as total_volume,
  95.0 + RANDOM() * 5 as success_rate, -- Entre 95% e 100%
  FLOOR(RANDOM() * 300 + 60) as avg_execution_time -- Entre 1-6 minutos
FROM investment_plans 
WHERE status = 'active'
ON CONFLICT (plan_id) DO NOTHING;