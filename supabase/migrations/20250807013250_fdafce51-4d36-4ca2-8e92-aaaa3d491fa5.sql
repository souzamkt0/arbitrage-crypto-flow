-- Função para validar referrals necessários antes de criar investimento
CREATE OR REPLACE FUNCTION public.validate_investment_referrals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_name TEXT;
  referral_count INTEGER;
  required_referrals INTEGER;
BEGIN
  -- Buscar o nome do plano de investimento
  SELECT name INTO plan_name 
  FROM public.investment_plans 
  WHERE id = NEW.investment_plan_id;
  
  -- Contar referrals ativos do usuário
  SELECT COUNT(*) INTO referral_count
  FROM public.referrals 
  WHERE referrer_id = NEW.user_id 
  AND status = 'active';
  
  -- Definir quantos referrals são necessários baseado no plano
  IF plan_name = 'Robô 4.0.5' THEN
    required_referrals := 10;
  ELSIF plan_name = 'Robô 4.1.0' THEN
    required_referrals := 20;
  ELSE
    -- Robô 4.0.0 não precisa de referrals
    required_referrals := 0;
  END IF;
  
  -- Validar se tem referrals suficientes
  IF referral_count < required_referrals THEN
    RAISE EXCEPTION 'Referrals insuficientes: você tem % referrals, mas precisa de % para investir no %', 
                    referral_count, required_referrals, plan_name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para validar antes de inserir investimento
CREATE TRIGGER validate_investment_referrals_trigger
  BEFORE INSERT ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_referrals();