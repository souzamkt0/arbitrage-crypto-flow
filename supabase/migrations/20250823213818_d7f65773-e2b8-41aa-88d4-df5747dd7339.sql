-- Corrigir sistema de comissões automáticas para indicações
-- Criar trigger para calcular comissões quando há investimentos

-- 1. Atualizar função de cálculo de comissão para ser mais robusta
CREATE OR REPLACE FUNCTION public.calculate_referral_commission_auto(referred_user_id uuid, investment_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_record RECORD;
  commission_amount DECIMAL(10,2);
BEGIN
  -- Buscar o indicador deste usuário
  SELECT r.referrer_id, r.commission_rate, r.id as referral_id
  INTO referrer_record
  FROM public.referrals r 
  WHERE r.referred_id = referred_user_id 
  AND r.status = 'active'
  LIMIT 1;
  
  IF referrer_record IS NOT NULL THEN
    -- Calcular comissão (padrão 10% se não especificado)
    commission_amount := investment_amount * (COALESCE(referrer_record.commission_rate, 10.00) / 100);
    
    -- Atualizar saldo de indicação do indicador
    UPDATE public.profiles 
    SET referral_balance = COALESCE(referral_balance, 0) + commission_amount
    WHERE user_id = referrer_record.referrer_id;
    
    -- Atualizar total de comissão na tabela de referrals
    UPDATE public.referrals 
    SET total_commission = COALESCE(total_commission, 0) + commission_amount
    WHERE id = referrer_record.referral_id;
    
    -- Log da comissão calculada
    RAISE LOG 'Comissão calculada: referrer=%, amount=%, commission=%', 
              referrer_record.referrer_id, investment_amount, commission_amount;
  END IF;
END;
$$;

-- 2. Criar trigger para investimentos
CREATE OR REPLACE FUNCTION public.trigger_calculate_referral_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Calcular comissão para o investimento
  PERFORM public.calculate_referral_commission_auto(NEW.user_id, NEW.amount);
  RETURN NEW;
END;
$$;

-- 3. Criar trigger na tabela user_investments
DROP TRIGGER IF EXISTS calculate_referral_commission_trigger ON public.user_investments;
CREATE TRIGGER calculate_referral_commission_trigger
  AFTER INSERT ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_calculate_referral_commission();

-- 4. Recalcular comissões para investimentos existentes dos usuários referidos
DO $$
DECLARE
  investment_record RECORD;
BEGIN
  -- Buscar todos os investimentos de usuários que foram referidos
  FOR investment_record IN
    SELECT ui.user_id, ui.amount, r.referrer_id, r.commission_rate, r.id as referral_id
    FROM user_investments ui
    JOIN referrals r ON ui.user_id = r.referred_id
    WHERE r.status = 'active'
    AND r.total_commission = 0  -- Apenas os que ainda não têm comissão
  LOOP
    -- Calcular comissão
    PERFORM public.calculate_referral_commission_auto(investment_record.user_id, investment_record.amount);
  END LOOP;
END $$;

-- 5. Verificar resultado
SELECT 
  'Comissões Atualizadas' as status,
  r.referral_code,
  referrer.username as referrer_username,
  referred.username as referred_username,
  r.total_commission,
  r.commission_rate
FROM referrals r
JOIN profiles referrer ON r.referrer_id = referrer.user_id
JOIN profiles referred ON r.referred_id = referred.user_id
WHERE r.total_commission > 0
ORDER BY r.created_at DESC;