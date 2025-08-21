-- Atualizar sistema de indicação para 10%
-- 1. Atualizar taxa padrão de comissão para 10%
ALTER TABLE public.referrals 
ALTER COLUMN commission_rate SET DEFAULT 10.00;

-- 2. Atualizar referrals existentes para 10%
UPDATE public.referrals 
SET commission_rate = 10.00 
WHERE commission_rate = 5.00;

-- 3. Criar função para calcular comissão de indicação com 10%
CREATE OR REPLACE FUNCTION public.calculate_referral_commission_10pct(
    referred_user_id UUID, 
    investment_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_record RECORD;
  commission_amount DECIMAL(10,2);
  residual_amount DECIMAL(10,2);
BEGIN
  -- Buscar o indicador deste usuário
  SELECT r.referrer_id, r.commission_rate 
  INTO referrer_record
  FROM public.referrals r 
  WHERE r.referred_id = referred_user_id 
  AND r.status = 'active';
  
  IF referrer_record IS NOT NULL THEN
    -- Calcular comissão de 10%
    commission_amount := investment_amount * 0.10; -- 10%
    residual_amount := investment_amount * 0.10; -- 10% residual
    
    -- Atualizar saldo de indicação do indicador (primeiro nível)
    UPDATE public.profiles 
    SET referral_balance = referral_balance + commission_amount
    WHERE user_id = referrer_record.referrer_id;
    
    -- Atualizar total de comissão na tabela de referrals
    UPDATE public.referrals 
    SET total_commission = total_commission + commission_amount
    WHERE referrer_id = referrer_record.referrer_id 
    AND referred_id = referred_user_id;
    
    -- Registrar ganho residual
    INSERT INTO public.residual_earnings (
      user_id,
      from_user_id,
      investment_id,
      amount,
      percentage,
      level,
      type,
      status
    ) VALUES (
      referrer_record.referrer_id,
      referred_user_id,
      NULL, -- será atualizado quando houver investimento específico
      residual_amount,
      10.00,
      1,
      'referral_bonus',
      'active'
    );
  END IF;
END;
$$;

-- 4. Criar função para obter saldo residual do usuário
CREATE OR REPLACE FUNCTION public.get_user_residual_balance(target_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_residual NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) 
  INTO total_residual
  FROM public.residual_earnings 
  WHERE user_id = target_user_id 
  AND status = 'active';
  
  RETURN total_residual;
END;
$$;

-- 5. Criar função para obter estatísticas de indicação do usuário
CREATE OR REPLACE FUNCTION public.get_user_referral_stats(target_user_id UUID)
RETURNS TABLE(
  total_referrals INTEGER,
  active_referrals INTEGER,
  total_commissions NUMERIC,
  residual_balance NUMERIC,
  this_month_earnings NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_referrals,
    COUNT(CASE WHEN r.status = 'active' THEN 1 END)::INTEGER as active_referrals,
    COALESCE(SUM(r.total_commission), 0) as total_commissions,
    COALESCE((
      SELECT SUM(re.amount) 
      FROM residual_earnings re 
      WHERE re.user_id = target_user_id 
      AND re.status = 'active'
    ), 0) as residual_balance,
    COALESCE((
      SELECT SUM(re.amount) 
      FROM residual_earnings re 
      WHERE re.user_id = target_user_id 
      AND re.created_at >= date_trunc('month', CURRENT_DATE)
      AND re.status = 'active'
    ), 0) as this_month_earnings
  FROM public.referrals r
  WHERE r.referrer_id = target_user_id;
END;
$$;