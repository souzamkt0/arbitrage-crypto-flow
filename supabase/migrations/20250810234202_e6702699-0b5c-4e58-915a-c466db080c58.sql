-- Zerar todos os saldos dos usuários
UPDATE public.profiles 
SET 
  balance = 0.00,
  referral_balance = 0.00,
  residual_balance = 0.00,
  total_profit = 0.00,
  earnings = 0.00,
  monthly_earnings = 0.00,
  updated_at = now();