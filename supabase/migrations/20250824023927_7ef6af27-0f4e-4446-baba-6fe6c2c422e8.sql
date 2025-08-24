-- Função para cancelar investimento de usuário (admin)
CREATE OR REPLACE FUNCTION public.admin_cancel_user_investment(
  p_investment_id UUID,
  p_reason TEXT DEFAULT 'Cancelamento administrativo'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investment_user_id UUID;
  v_investment_amount NUMERIC;
  v_investment_status TEXT;
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

  -- Buscar investimento e informações do usuário separadamente
  SELECT user_id, amount, status INTO v_investment_user_id, v_investment_amount, v_investment_status
  FROM user_investments 
  WHERE id = p_investment_id;

  IF v_investment_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Investimento não encontrado'
    );
  END IF;

  -- Buscar email do usuário
  SELECT email INTO v_user_email
  FROM profiles 
  WHERE user_id = v_investment_user_id;

  -- Não permitir cancelar investimentos já finalizados
  IF v_investment_status = 'completed' THEN
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
    v_investment_user_id,
    auth.uid(),
    0, -- Não alteramos saldo, apenas cancelamos
    0,
    0,
    'investment_cancellation',
    p_reason || ' - Investimento: ' || v_investment_amount
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Investimento cancelado com sucesso',
    'user_email', v_user_email,
    'investment_amount', v_investment_amount,
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