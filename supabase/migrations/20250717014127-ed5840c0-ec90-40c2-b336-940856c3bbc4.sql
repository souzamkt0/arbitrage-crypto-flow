-- Criar o usuário admin e configurar seu perfil
-- Primeiro, vamos zerar todos os saldos existentes
UPDATE public.profiles SET 
  balance = 0.00,
  referral_balance = 0.00,
  residual_balance = 0.00,
  total_profit = 0.00,
  earnings = 0.00,
  monthly_earnings = 0.00;

-- Inserir referral para o usuário admin (souzamkt0@gmail.com)
-- O ID será gerado automaticamente quando o usuário se registrar
-- Mas vamos preparar um código de referência padrão para ele
INSERT INTO public.referrals (referrer_id, referred_id, referral_code, commission_rate, status)
SELECT 
  p1.user_id,
  p2.user_id,
  'SOUZAMKT0_REF',
  10.00,
  'active'
FROM public.profiles p1
CROSS JOIN public.profiles p2
WHERE p1.email = 'souzamkt0@gmail.com' 
AND p2.email != 'souzamkt0@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.referrals r 
  WHERE r.referrer_id = p1.user_id AND r.referred_id = p2.user_id
);

-- Função para definir usuário como admin
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = user_email;
END;
$$;