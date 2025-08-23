-- Criar tabela para ganhos diários simulados
CREATE TABLE IF NOT EXISTS public.daily_profits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_invested NUMERIC(10,2) NOT NULL DEFAULT 0,
  daily_target NUMERIC(10,2) NOT NULL DEFAULT 0,
  today_profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.5,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Garantir um registro por usuário por dia
  UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.daily_profits ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios ganhos
CREATE POLICY "Users can view their own daily profits" 
ON public.daily_profits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para inserção/atualização
CREATE POLICY "Users can upsert their own daily profits" 
ON public.daily_profits 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função para calcular e armazenar ganhos diários
CREATE OR REPLACE FUNCTION calculate_and_store_daily_profit(target_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_total_invested NUMERIC := 0;
    daily_rate NUMERIC := 2.5;
    daily_target NUMERIC := 0;
    current_hour INTEGER;
    time_progress NUMERIC;
    calculated_profit NUMERIC;
    stored_profit NUMERIC := 0;
BEGIN
    -- Buscar total investido pelo usuário
    SELECT COALESCE(SUM(amount), 0)
    INTO user_total_invested
    FROM user_investments 
    WHERE user_id = target_user_id 
    AND status = 'active';
    
    -- Se não há investimentos, retornar 0
    IF user_total_invested = 0 THEN
        RETURN 0;
    END IF;
    
    -- Calcular meta diária
    daily_target := user_total_invested * (daily_rate / 100);
    
    -- Calcular progresso baseado na hora atual (com mínimo de 10% para não ficar zero)
    current_hour := EXTRACT(HOUR FROM NOW());
    time_progress := GREATEST(0.1, current_hour / 24.0);
    
    -- Calcular ganho com variação realística
    calculated_profit := daily_target * time_progress * (0.8 + RANDOM() * 0.4);
    calculated_profit := ROUND(calculated_profit, 2);
    
    -- Inserir ou atualizar registro do dia
    INSERT INTO daily_profits (
        user_id,
        date,
        total_invested,
        daily_target,
        today_profit,
        profit_percentage,
        last_updated
    ) VALUES (
        target_user_id,
        CURRENT_DATE,
        user_total_invested,
        daily_target,
        calculated_profit,
        daily_rate,
        NOW()
    ) ON CONFLICT (user_id, date) 
    DO UPDATE SET
        total_invested = EXCLUDED.total_invested,
        daily_target = EXCLUDED.daily_target,
        today_profit = EXCLUDED.today_profit,
        last_updated = NOW()
    RETURNING today_profit INTO stored_profit;
    
    RETURN stored_profit;
END;
$$;