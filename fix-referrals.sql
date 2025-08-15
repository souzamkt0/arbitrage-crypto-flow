-- Script para corrigir a configuração de referrals
-- Execute este SQL no Dashboard do Supabase > SQL Editor

-- 1. Adicionar coluna required_referrals se não existir
ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS required_referrals INTEGER DEFAULT 0 NOT NULL;

-- 2. Atualizar valores dos planos existentes
-- Robô 4.0.0 = 0 referrals
UPDATE public.investment_plans 
SET required_referrals = 0 
WHERE name ILIKE '%4.0.0%' OR name ILIKE '%4.0%';

-- Robô 4.0.5 = 10 referrals
UPDATE public.investment_plans 
SET required_referrals = 10 
WHERE name ILIKE '%4.0.5%';

-- Robô 4.1.0 = 20 referrals
UPDATE public.investment_plans 
SET required_referrals = 20 
WHERE name ILIKE '%4.1.0%';

-- 3. Verificar resultado
SELECT name, required_referrals, status 
FROM public.investment_plans 
ORDER BY name;

-- 4. Criar função de validação de referrals
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

-- 5. Criar trigger para validar referrals antes de investir
DROP TRIGGER IF EXISTS validate_referrals_trigger ON public.user_investments;
CREATE TRIGGER validate_referrals_trigger
  BEFORE INSERT ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_referrals();

-- 6. Verificar se a tabela referrals existe
SELECT COUNT(*) as total_referrals FROM public.referrals;

-- 7. Verificar estrutura da tabela profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;