-- Adicionar coluna para definir quantos referrals são necessários para cada plano
ALTER TABLE public.investment_plans 
ADD COLUMN required_referrals INTEGER DEFAULT 0 NOT NULL;

-- Atualizar planos existentes com os valores atuais
UPDATE public.investment_plans 
SET required_referrals = 0 
WHERE name LIKE '%4.0.0%' OR name LIKE '%4.0%';

UPDATE public.investment_plans 
SET required_referrals = 10 
WHERE name LIKE '%4.0.5%';

UPDATE public.investment_plans 
SET required_referrals = 20 
WHERE name LIKE '%4.1.0%';

-- Atualizar a função de validação para usar o valor da tabela
CREATE OR REPLACE FUNCTION public.validate_investment_referrals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_record RECORD;
  referral_count INTEGER;
BEGIN
  -- Buscar o plano de investimento com required_referrals
  SELECT name, required_referrals INTO plan_record 
  FROM public.investment_plans 
  WHERE id = NEW.investment_plan_id;
  
  -- Contar referrals ativos do usuário
  SELECT COUNT(*) INTO referral_count
  FROM public.referrals 
  WHERE referrer_id = NEW.user_id 
  AND status = 'active';
  
  -- Validar se tem referrals suficientes
  IF referral_count < plan_record.required_referrals THEN
    RAISE EXCEPTION 'Referrals insuficientes: você tem % referrals, mas precisa de % para investir no %', 
                    referral_count, plan_record.required_referrals, plan_record.name;
  END IF;
  
  RETURN NEW;
END;
$$;