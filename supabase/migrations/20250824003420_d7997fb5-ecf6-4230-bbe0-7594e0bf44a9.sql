-- Criar tabela para taxas diárias dinâmicas do mercado
CREATE TABLE IF NOT EXISTS daily_market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_rate DECIMAL(5,4) NOT NULL, -- Taxa atual do dia (ex: 2.5% = 2.5000)
  min_rate DECIMAL(5,4) NOT NULL, -- Taxa mínima possível
  max_rate DECIMAL(5,4) NOT NULL, -- Taxa máxima possível (daily_rate do plano)
  hourly_rates JSONB DEFAULT '{}', -- Taxas por hora do dia
  market_sentiment TEXT DEFAULT 'neutral', -- bullish, bearish, neutral
  volatility_index DECIMAL(5,2) DEFAULT 50.00, -- Índice de volatilidade 0-100
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(plan_id, date)
);

-- Habilitar RLS
ALTER TABLE daily_market_rates ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Anyone can view daily market rates" ON daily_market_rates
FOR SELECT USING (true);

-- Política para inserção/atualização pelo sistema
CREATE POLICY "System can manage daily market rates" ON daily_market_rates
FOR ALL WITH CHECK (true);

-- Criar função para atualizar taxa atual baseada na hora
CREATE OR REPLACE FUNCTION update_current_market_rate(p_plan_id UUID)
RETURNS VOID AS $$
DECLARE
  v_plan investment_plans%ROWTYPE;
  v_current_hour INTEGER;
  v_new_rate DECIMAL(5,4);
  v_volatility DECIMAL(5,2);
BEGIN
  -- Buscar informações do plano
  SELECT * INTO v_plan FROM investment_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Hora atual (0-23)
  v_current_hour := EXTRACT(HOUR FROM NOW());
  
  -- Calcular volatilidade baseada na hora (maior volatilidade em horários de mercado)
  v_volatility := CASE 
    WHEN v_current_hour BETWEEN 9 AND 16 THEN 70.0 + (RANDOM() * 30) -- Horário comercial mais volátil
    WHEN v_current_hour BETWEEN 18 AND 22 THEN 60.0 + (RANDOM() * 20) -- Noite moderadamente volátil
    ELSE 40.0 + (RANDOM() * 20) -- Madrugada menos volátil
  END;
  
  -- Calcular nova taxa (entre 10% e 90% da taxa máxima do plano)
  v_new_rate := v_plan.daily_rate * (0.1 + (RANDOM() * 0.8));
  
  -- Inserir ou atualizar taxa diária
  INSERT INTO daily_market_rates (
    plan_id,
    current_rate,
    min_rate,
    max_rate,
    volatility_index,
    hourly_rates
  ) VALUES (
    p_plan_id,
    v_new_rate,
    v_plan.daily_rate * 0.1, -- 10% da taxa máxima
    v_plan.daily_rate, -- Taxa máxima do plano
    v_volatility,
    jsonb_build_object(v_current_hour::text, v_new_rate)
  )
  ON CONFLICT (plan_id, date) DO UPDATE SET
    current_rate = v_new_rate,
    volatility_index = v_volatility,
    hourly_rates = daily_market_rates.hourly_rates || jsonb_build_object(v_current_hour::text, v_new_rate),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Inserir dados iniciais para todos os planos ativos
DO $$
DECLARE
  plan_record RECORD;
BEGIN
  FOR plan_record IN SELECT id FROM investment_plans WHERE status = 'active' LOOP
    PERFORM update_current_market_rate(plan_record.id);
  END LOOP;
END $$;