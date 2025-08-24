-- Criar função admin para atualizar planos de investimento 
-- Esta função contorna a RLS para permitir atualizações de admins

CREATE OR REPLACE FUNCTION admin_update_investment_plan(
  plan_id_param UUID,
  new_daily_rate NUMERIC,
  new_max_daily_return NUMERIC,
  admin_email TEXT DEFAULT 'admin@clean.com'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  old_rate NUMERIC;
  old_max NUMERIC;
BEGIN
  -- Verificar se é um admin autorizado
  IF admin_email NOT IN ('admin@clean.com', 'souzamkt0@gmail.com', 'dagosaraiva@hotmail.com') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores autorizados'
    );
  END IF;

  -- Buscar valores atuais
  SELECT daily_rate, max_daily_return 
  INTO old_rate, old_max
  FROM investment_plans 
  WHERE id = plan_id_param;

  -- Verificar se o plano existe
  IF old_rate IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Plano de investimento não encontrado'
    );
  END IF;

  -- Validar novos valores
  IF new_daily_rate < 0.0001 OR new_daily_rate > new_max_daily_return THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Taxa diária deve estar entre 0.01% e o máximo permitido'
    );
  END IF;

  -- Atualizar o plano
  UPDATE investment_plans 
  SET 
    daily_rate = new_daily_rate,
    max_daily_return = new_max_daily_return,
    updated_at = NOW()
  WHERE id = plan_id_param;

  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Falha ao atualizar o plano'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Plano atualizado com sucesso',
    'plan_id', plan_id_param,
    'old_daily_rate', old_rate,
    'new_daily_rate', new_daily_rate,
    'old_max_daily_return', old_max,
    'new_max_daily_return', new_max_daily_return,
    'admin_email', admin_email
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;