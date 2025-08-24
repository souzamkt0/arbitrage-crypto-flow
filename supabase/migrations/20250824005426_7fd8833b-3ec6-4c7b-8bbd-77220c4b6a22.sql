-- Criar função RPC para buscar investimentos ativos do usuário
CREATE OR REPLACE FUNCTION public.get_user_active_investments()
RETURNS TABLE(
  id UUID,
  investment_plan_id UUID,
  amount NUMERIC,
  daily_rate NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_earned NUMERIC,
  today_earnings NUMERIC,
  status TEXT,
  operations_completed INTEGER,
  total_operations INTEGER,
  current_day_progress NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  plan_name TEXT,
  plan_robot_version TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id,
    ui.investment_plan_id,
    ui.amount,
    ui.daily_rate,
    ui.start_date,
    ui.end_date,
    ui.total_earned,
    ui.today_earnings,
    ui.status,
    ui.operations_completed,
    ui.total_operations,
    ui.current_day_progress,
    ui.created_at,
    ui.updated_at,
    ip.name as plan_name,
    ip.robot_version as plan_robot_version
  FROM public.user_investments ui
  LEFT JOIN public.investment_plans ip ON ip.id = ui.investment_plan_id
  WHERE ui.user_id = auth.uid()
  AND ui.status = 'active'
  ORDER BY ui.created_at DESC;
END;
$$;

-- Garantir que as políticas RLS permitem acesso direto à tabela também
DROP POLICY IF EXISTS "Users can view their own investments" ON public.user_investments;
CREATE POLICY "Users can view their own investments" 
ON public.user_investments 
FOR SELECT 
USING (user_id = auth.uid());

-- Comentário para documentação
COMMENT ON FUNCTION public.get_user_active_investments() IS 'Busca todos os investimentos ativos do usuário autenticado com informações do plano';