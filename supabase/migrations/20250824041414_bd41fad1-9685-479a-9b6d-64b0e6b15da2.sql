-- Atualizar planos de investimento com novos robôs e regras
UPDATE investment_plans SET 
  name = 'Robô 4.0.0',
  description = 'Sistema Automatizado - Ganhos até 2% (variável, não garantido fixo através de arbitragem)',
  daily_rate = 0.02,
  max_daily_return = 2.0,
  trading_strategy = 'conservador',
  minimum_indicators = 0,
  features = '[
    "Arbitragem automatizada",
    "Ganhos não garantidos",
    "Variável até 2%",
    "Sistema automatizado",
    "Sem requisitos de indicação"
  ]'::jsonb
WHERE trading_strategy = 'conservador';

UPDATE investment_plans SET 
  name = 'Robô 4.0.5',
  description = 'Paga até 3% - Requer 10 pessoas ativas no Robô 4.0.0 com planos ativos',
  daily_rate = 0.03,
  max_daily_return = 3.0,
  trading_strategy = 'moderado',
  minimum_indicators = 10,
  features = '[
    "Ganhos até 3%",
    "Requer 10 indicados ativos",
    "Indicados devem ter planos ativos no Robô 4.0.0",
    "Sistema automatizado",
    "Validação automática de requisitos"
  ]'::jsonb
WHERE trading_strategy = 'moderado';

UPDATE investment_plans SET 
  name = 'Robô 4.1.0',
  description = 'Sistema Automatizado - Pode ganhar até 4% - Requer 40 pessoas ativas no Robô 4.0.5',
  daily_rate = 0.04,
  max_daily_return = 4.0,
  trading_strategy = 'livre',
  minimum_indicators = 40,
  features = '[
    "Ganhos até 4%",
    "Requer 40 indicados ativos",
    "Indicados devem ter planos ativos no Robô 4.0.5",
    "Sistema automatizado avançado",
    "Validação rigorosa de requisitos"
  ]'::jsonb
WHERE trading_strategy = 'livre';

-- Criar função para verificar indicações ativas em planos específicos
CREATE OR REPLACE FUNCTION public.count_active_referrals_in_plan(
  referrer_user_id UUID,
  target_plan_strategy TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_count INTEGER := 0;
BEGIN
  -- Contar indicados ativos que têm investimentos ativos no plano específico
  SELECT COUNT(DISTINCT r.referred_id) INTO active_count
  FROM referrals r
  INNER JOIN profiles p ON r.referred_id = p.user_id
  INNER JOIN user_investments ui ON r.referred_id = ui.user_id
  INNER JOIN investment_plans ip ON ui.investment_plan_id = ip.id
  WHERE r.referrer_id = referrer_user_id
    AND r.status = 'active'
    AND p.status = 'active'
    AND ui.status = 'active'
    AND ip.trading_strategy = target_plan_strategy;
    
  RETURN active_count;
END;
$$;

-- Criar função para validar se pode ativar plano baseado em indicações
CREATE OR REPLACE FUNCTION public.can_activate_plan(
  user_id_param UUID,
  plan_strategy TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  required_count INTEGER := 0;
  actual_count INTEGER := 0;
BEGIN
  -- Definir requisitos por estratégia
  CASE plan_strategy
    WHEN 'conservador' THEN required_count := 0; -- Robô 4.0.0 - sem requisitos
    WHEN 'moderado' THEN required_count := 10;   -- Robô 4.0.5 - 10 ativos no 4.0.0
    WHEN 'livre' THEN required_count := 40;      -- Robô 4.1.0 - 40 ativos no 4.0.5
    ELSE required_count := 0;
  END CASE;
  
  -- Se não tem requisitos, pode ativar
  IF required_count = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar indicações ativas no plano anterior
  IF plan_strategy = 'moderado' THEN
    -- Para 4.0.5, precisa de 10 ativos no 4.0.0 (conservador)
    actual_count := count_active_referrals_in_plan(user_id_param, 'conservador');
  ELSIF plan_strategy = 'livre' THEN
    -- Para 4.1.0, precisa de 40 ativos no 4.0.5 (moderado)
    actual_count := count_active_referrals_in_plan(user_id_param, 'moderado');
  END IF;
  
  RETURN actual_count >= required_count;
END;
$$;