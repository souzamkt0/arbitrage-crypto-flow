-- Função para listar todos os investimentos (admin)
CREATE OR REPLACE FUNCTION public.admin_get_all_investments()
RETURNS TABLE(
  investment_id UUID,
  user_email TEXT,
  user_name TEXT,
  plan_name TEXT,
  amount NUMERIC,
  daily_rate NUMERIC,
  total_earned NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem visualizar todos os investimentos';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id as investment_id,
    p.email as user_email,
    p.display_name as user_name,
    ip.name as plan_name,
    ui.amount,
    ui.daily_rate,
    ui.total_earned,
    ui.status,
    ui.created_at,
    GREATEST(0, ui.duration_days - EXTRACT(DAYS FROM (NOW() - ui.created_at))::INTEGER) as days_remaining
  FROM user_investments ui
  INNER JOIN profiles p ON ui.user_id = p.user_id
  INNER JOIN investment_plans ip ON ui.plan_id = ip.id
  ORDER BY ui.created_at DESC;
END;
$$;