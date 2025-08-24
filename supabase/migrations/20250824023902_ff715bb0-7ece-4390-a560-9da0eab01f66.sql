-- Função para atualizar taxa de um plano com histórico
CREATE OR REPLACE FUNCTION public.admin_update_plan_rate(
  p_plan_id UUID,
  p_new_rate NUMERIC,
  p_reason TEXT DEFAULT 'Ajuste administrativo',
  p_effective_date DATE DEFAULT CURRENT_DATE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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