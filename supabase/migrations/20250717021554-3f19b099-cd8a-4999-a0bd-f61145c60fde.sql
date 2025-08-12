-- Zerar TODOS os saldos e dados financeiros do sistema (incluindo admin)

-- 1. Zerar completamente todos os saldos na tabela profiles (incluindo admin)
UPDATE public.profiles SET 
  balance = 0.00,
  referral_balance = 0.00,
  residual_balance = 0.00,
  total_profit = 0.00,
  earnings = 0.000,
  monthly_earnings = 0.000;

-- 2. Remover todos os depósitos
DELETE FROM public.deposits;

-- 3. Remover todos os saques
DELETE FROM public.withdrawals;

-- 4. Remover todos os investimentos
DELETE FROM public.user_investments;

-- 5. Remover todas as operações atuais
DELETE FROM public.current_operations;

-- 6. Remover todo o histórico de trading
DELETE FROM public.trading_history;

-- 7. Remover todos os earnings residuais
DELETE FROM public.residual_earnings;

-- 8. Zerar comissões dos referrals
UPDATE public.referrals SET 
  total_commission = 0.00;

-- 9. Remover todos os treasure chests
DELETE FROM public.treasure_chests;

-- 10. Resetar contadores de posts (opcional)
UPDATE public.profiles SET 
  posts_count = 0,
  followers_count = 0,
  following_count = 0;