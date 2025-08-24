-- Adicionar configurações de trading aos planos de investimento
ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS max_daily_return NUMERIC DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS trading_strategy TEXT DEFAULT 'conservador',
ADD COLUMN IF NOT EXISTS risk_level INTEGER DEFAULT 1;

-- Atualizar planos existentes com as novas configurações
UPDATE public.investment_plans 
SET 
  max_daily_return = CASE 
    WHEN name ILIKE '%4.0.0%' THEN 2.0
    WHEN name ILIKE '%4.0.5%' THEN 3.0  
    WHEN name ILIKE '%4.1.0%' THEN 4.0
    ELSE 2.0
  END,
  trading_strategy = 'conservador',
  risk_level = CASE 
    WHEN name ILIKE '%4.0.0%' THEN 1
    WHEN name ILIKE '%4.0.5%' THEN 2
    WHEN name ILIKE '%4.1.0%' THEN 3
    ELSE 1
  END;

-- Criar tabela de configurações de trading
CREATE TABLE IF NOT EXISTS public.trading_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.investment_plans(id),
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('conservador', 'moderado', 'livre')),
  max_daily_return NUMERIC NOT NULL,
  min_daily_return NUMERIC NOT NULL DEFAULT 0.5,
  operations_per_day INTEGER NOT NULL DEFAULT 6,
  risk_factor NUMERIC NOT NULL DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.trading_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage trading configurations" 
ON public.trading_configurations FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active trading configurations" 
ON public.trading_configurations FOR SELECT 
USING (active = true);

-- Inserir configurações padrão
INSERT INTO public.trading_configurations (plan_id, strategy_type, max_daily_return, min_daily_return, operations_per_day, risk_factor)
SELECT 
  id as plan_id,
  'conservador' as strategy_type,
  CASE 
    WHEN name ILIKE '%4.0.0%' THEN 2.0
    WHEN name ILIKE '%4.0.5%' THEN 3.0
    WHEN name ILIKE '%4.1.0%' THEN 4.0
    ELSE 2.0
  END as max_daily_return,
  0.5 as min_daily_return,
  6 as operations_per_day,
  1.0 as risk_factor
FROM public.investment_plans 
WHERE status = 'active'
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_trading_configurations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_trading_configurations_updated_at
    BEFORE UPDATE ON public.trading_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_configurations_updated_at();