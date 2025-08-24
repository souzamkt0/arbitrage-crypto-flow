-- Criar tabela para histórico de alterações de planos
CREATE TABLE IF NOT EXISTS public.plan_rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES investment_plans(id) ON DELETE CASCADE,
  old_daily_rate NUMERIC NOT NULL,
  new_daily_rate NUMERIC NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(user_id),
  reason TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar RLS na tabela de histórico
ALTER TABLE public.plan_rate_history ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem histórico
CREATE POLICY "Admins can view plan rate history" 
ON public.plan_rate_history 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Política para admins inserirem histórico
CREATE POLICY "Admins can insert plan rate history" 
ON public.plan_rate_history 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Função para atualizar taxa de um plano com histórico
CREATE OR REPLACE FUNCTION public.admin_update_plan_rate(
  p_plan_id UUID,
  p_new_rate NUMERIC,
  p_reason TEXT DEFAULT 'Ajuste administrativo',
  p_effective_date DATE DEFAULT CURRENT_DATE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_rate NUMERIC;
  v_plan_name TEXT;
  v_affected_investments INTEGER;
  result JSON;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas administradores podem alterar taxas de planos'
    );
  END IF;

  -- Buscar taxa atual do plano
  SELECT daily_rate, name INTO v_old_rate, v_plan_name
  FROM investment_plans 
  WHERE id = p_plan_id;

  IF v_old_rate IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Plano não encontrado'
    );
  END IF;

  -- Verificar se a nova taxa é diferente
  IF v_old_rate = p_new_rate THEN
    RETURN json_build_object(
      'success', false,
      'error', 'A nova taxa é igual à taxa atual'
    );
  END IF;

  -- Contar investimentos ativos afetados
  SELECT COUNT(*) INTO v_affected_investments
  FROM user_investments ui
  INNER JOIN investment_plans ip ON ui.plan_id = ip.id
  WHERE ip.id = p_plan_id AND ui.status = 'active';

  -- Registrar no histórico
  INSERT INTO plan_rate_history (
    plan_id,
    old_daily_rate,
    new_daily_rate,
    changed_by,
    reason,
    effective_date
  ) VALUES (
    p_plan_id,
    v_old_rate,
    p_new_rate,
    auth.uid(),
    p_reason,
    p_effective_date
  );

  -- Atualizar o plano
  UPDATE investment_plans 
  SET 
    daily_rate = p_new_rate,
    updated_at = NOW()
  WHERE id = p_plan_id;

  -- Atualizar investimentos ativos se a data efetiva for hoje
  IF p_effective_date <= CURRENT_DATE THEN
    UPDATE user_investments 
    SET 
      daily_rate = p_new_rate,
      updated_at = NOW()
    WHERE plan_id = p_plan_id AND status = 'active';
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Taxa do plano atualizada com sucesso',
    'plan_name', v_plan_name,
    'old_rate', v_old_rate,
    'new_rate', p_new_rate,
    'affected_investments', v_affected_investments
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Função para excluir investimento de usuário (admin)
CREATE OR REPLACE FUNCTION public.admin_cancel_user_investment(
  p_investment_id UUID,
  p_reason TEXT DEFAULT 'Cancelamento administrativo'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_investment user_investments%ROWTYPE;
  v_user_email TEXT;
  result JSON;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas administradores podem cancelar investimentos'
    );
  END IF;

  -- Buscar investimento e informações do usuário
  SELECT ui.*, p.email INTO v_investment, v_user_email
  FROM user_investments ui
  INNER JOIN profiles p ON ui.user_id = p.user_id
  WHERE ui.id = p_investment_id;

  IF v_investment.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Investimento não encontrado'
    );
  END IF;

  -- Não permitir cancelar investimentos já finalizados
  IF v_investment.status = 'completed' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Não é possível cancelar investimentos já finalizados'
    );
  END IF;

  -- Atualizar status para cancelado
  UPDATE user_investments 
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_investment_id;

  -- Registrar transação administrativa
  INSERT INTO admin_balance_transactions (
    user_id,
    admin_user_id,
    amount_before,
    amount_after,
    amount_changed,
    transaction_type,
    reason
  ) VALUES (
    v_investment.user_id,
    auth.uid(),
    0, -- Não alteramos saldo, apenas cancelamos
    0,
    0,
    'investment_cancellation',
    p_reason || ' - Investimento: ' || v_investment.amount
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Investimento cancelado com sucesso',
    'user_email', v_user_email,
    'investment_amount', v_investment.amount,
    'reason', p_reason
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Função para listar todos os investimentos ativos (admin)
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