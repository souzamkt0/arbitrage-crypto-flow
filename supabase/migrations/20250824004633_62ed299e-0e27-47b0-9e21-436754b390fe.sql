-- Criar tabela user_investments se não existir
CREATE TABLE IF NOT EXISTS public.user_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  investment_plan_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  daily_rate DECIMAL(5,2) NOT NULL DEFAULT 2.5,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  today_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  operations_completed INTEGER NOT NULL DEFAULT 0,
  total_operations INTEGER NOT NULL DEFAULT 30,
  current_day_progress DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own investments" 
ON public.user_investments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" 
ON public.user_investments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" 
ON public.user_investments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments" 
ON public.user_investments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON public.user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_plan_id ON public.user_investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON public.user_investments(status);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_investments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_investments_updated_at
    BEFORE UPDATE ON public.user_investments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_investments_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.user_investments IS 'Tabela que armazena os investimentos dos usuários nos planos';
COMMENT ON COLUMN public.user_investments.amount IS 'Valor investido em USDT';
COMMENT ON COLUMN public.user_investments.daily_rate IS 'Taxa diária de retorno em porcentagem';
COMMENT ON COLUMN public.user_investments.total_earned IS 'Total ganho até o momento';
COMMENT ON COLUMN public.user_investments.today_earnings IS 'Ganhos do dia atual';
COMMENT ON COLUMN public.user_investments.operations_completed IS 'Número de operações completadas';
COMMENT ON COLUMN public.user_investments.total_operations IS 'Total de operações planejadas';
COMMENT ON COLUMN public.user_investments.current_day_progress IS 'Progresso do dia atual em porcentagem';