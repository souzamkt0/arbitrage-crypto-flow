-- Script para atualizar os planos de investimento com as novas regras
-- Execute este SQL no Dashboard do Supabase > SQL Editor

-- 1. Adicionar colunas necessárias se não existirem
ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS required_referrals INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS contract_fee DECIMAL(10,2) DEFAULT 0 NOT NULL;

ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(5,2) DEFAULT 0 NOT NULL;

-- 2. Atualizar Robô 4.0.0 (Iniciante)
UPDATE public.investment_plans 
SET 
  required_referrals = 0,
  daily_rate = 2.5,
  minimum_amount = 10,
  contract_fee = 0,
  description = 'Plano inicial sem necessidade de indicações'
WHERE name ILIKE '%4.0.0%' OR name ILIKE 'Robô 4.0%';

-- 3. Atualizar Robô 4.0.5 (Intermediário)
UPDATE public.investment_plans 
SET 
  required_referrals = 10,
  daily_rate = 3.0,
  minimum_amount = 20,
  contract_fee = 10,
  description = 'Plano intermediário com 10 indicações ativas'
WHERE name ILIKE '%4.0.5%';

-- 4. Atualizar Robô 4.1.0 (Premium)
UPDATE public.investment_plans 
SET 
  required_referrals = 20,
  daily_rate = 4.0,
  minimum_amount = 500,
  contract_fee = 10,
  description = 'Plano premium com 20 indicações ativas'
WHERE name ILIKE '%4.1.0%';

-- 5. Inserir planos se não existirem
INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.0.0', 2.5, 10, 100, 30, 'Plano inicial sem necessidade de indicações', 'active', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.0.0%');

INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.0.5', 3.0, 20, 200, 30, 'Plano intermediário com 10 indicações ativas', 'active', 10, 10
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.0.5%');

INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.1.0', 4.0, 500, 5000, 30, 'Plano premium com 20 indicações ativas', 'active', 20, 10
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.1.0%');

-- 6. Verificar resultado final
SELECT 
  name,
  daily_rate,
  minimum_amount,
  maximum_amount,
  required_referrals,
  contract_fee,
  description,
  status
FROM public.investment_plans 
ORDER BY required_referrals, name;

-- 7. Criar função para validar investimentos baseados em indicações
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
  SELECT name, required_referrals, contract_fee INTO plan_record 
  FROM public.investment_plans 
  WHERE id = NEW.investment_plan_id;
  
  -- Contar referrals ativos do usuário
  SELECT COUNT(*) INTO referral_count
  FROM public.referrals 
  WHERE referrer_id = NEW.user_id 
  AND status = 'active';
  
  -- Validar se tem referrals suficientes
  IF referral_count < plan_record.required_referrals THEN
    RAISE EXCEPTION 'Você precisa de % indicações ativas para investir no plano %. Você tem apenas % indicações.',
      plan_record.required_referrals, plan_record.name, referral_count;
  END IF;
  
  -- Validar se o valor mínimo inclui a taxa de contrato
  IF plan_record.contract_fee > 0 AND NEW.amount < (SELECT minimum_amount FROM public.investment_plans WHERE id = NEW.investment_plan_id) THEN
    RAISE EXCEPTION 'O investimento mínimo para este plano é $ % USDT (não inclui taxa de contrato de $ % USDT)',
      (SELECT minimum_amount FROM public.investment_plans WHERE id = NEW.investment_plan_id),
      plan_record.contract_fee;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Criar trigger para validação automática
DROP TRIGGER IF EXISTS trigger_validate_investment_referrals ON public.user_investments;
CREATE TRIGGER trigger_validate_investment_referrals
  BEFORE INSERT ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.validate_investment_referrals();

-- 9. Comentários para documentação
COMMENT ON COLUMN public.investment_plans.required_referrals IS 'Número de indicações ativas necessárias para acessar este plano';
COMMENT ON COLUMN public.investment_plans.contract_fee IS 'Taxa de contrato em USDT que deve ser paga além do investimento mínimo';
COMMENT ON COLUMN public.investment_plans.daily_rate IS 'Taxa de retorno diária em porcentagem';

COMMENT ON FUNCTION public.validate_investment_referrals() IS 'Valida se o usuário tem indicações suficientes antes de permitir investimento';

-- 10. Criar view para facilitar consultas
CREATE OR REPLACE VIEW public.investment_plans_with_requirements AS
SELECT 
  ip.*,
  CASE 
    WHEN ip.required_referrals = 0 THEN 'Iniciante'
    WHEN ip.required_referrals = 10 THEN 'Intermediário'
    WHEN ip.required_referrals = 20 THEN 'Premium'
    ELSE 'Personalizado'
  END as level_name,
  CASE 
    WHEN ip.contract_fee > 0 THEN 
      CONCAT('Investimento mínimo: $', ip.minimum_amount, ' USDT + Taxa de contrato: $', ip.contract_fee, ' USDT')
    ELSE 
      CONCAT('Investimento mínimo: $', ip.minimum_amount, ' USDT')
  END as investment_summary
FROM public.investment_plans ip
WHERE ip.status = 'active'
ORDER BY ip.required_referrals;

COMMENT ON VIEW public.investment_plans_with_requirements IS 'View que mostra os planos com informações de nível e resumo de investimento';

-- Finalizado!
SELECT '✅ Script executado com sucesso! Planos de investimento atualizados.' as status;