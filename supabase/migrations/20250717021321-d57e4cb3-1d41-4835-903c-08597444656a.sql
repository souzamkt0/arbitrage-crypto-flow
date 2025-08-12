-- Zerar todos os saldos das tabelas do sistema

-- Zerar saldos na tabela profiles
UPDATE public.profiles SET 
  balance = 0.00,
  referral_balance = 0.00,
  residual_balance = 0.00,
  total_profit = 0.00,
  earnings = 0.000,
  monthly_earnings = 0.000;

-- Zerar comissões na tabela referrals
UPDATE public.referrals SET 
  total_commission = 0.00;

-- Zerar valores na tabela user_investments
UPDATE public.user_investments SET 
  total_earned = 0.00,
  today_earnings = 0.00;

-- Remover histórico de trading (opcional)
-- DELETE FROM public.trading_history;

-- Remover earnings residuais (opcional)
-- DELETE FROM public.residual_earnings;

-- Remover operações atuais (opcional)
-- DELETE FROM public.current_operations;

-- Remover treasure chests (opcional)  
-- DELETE FROM public.treasure_chests;