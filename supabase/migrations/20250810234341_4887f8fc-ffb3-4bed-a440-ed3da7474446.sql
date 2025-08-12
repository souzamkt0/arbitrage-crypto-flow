-- Zerar todos os saldos e valores monetários em todas as tabelas

-- Zerar investimentos dos usuários
UPDATE public.user_investments 
SET 
  amount = 0.00,
  total_earned = 0.00,
  today_earnings = 0.00,
  daily_target = 0.00,
  updated_at = now();

-- Zerar depósitos
UPDATE public.deposits 
SET 
  amount_usd = 0.00,
  amount_brl = 0.00,
  updated_at = now();

-- Zerar saques
UPDATE public.withdrawals 
SET 
  amount_usd = 0.00,
  amount_brl = 0.00,
  fee = 0.00,
  net_amount = 0.00,
  updated_at = now();

-- Zerar transações DigitoPay
UPDATE public.digitopay_transactions 
SET 
  amount = 0.00,
  amount_brl = 0.00,
  updated_at = now();

-- Zerar comissões de referrals
UPDATE public.referrals 
SET 
  total_commission = 0.00,
  updated_at = now();

-- Zerar ganhos residuais
UPDATE public.residual_earnings 
SET 
  amount = 0.00,
  updated_at = now();

-- Zerar histórico de trading
UPDATE public.trading_history 
SET 
  buy_price = 0.00,
  sell_price = 0.00,
  amount = 0.00,
  profit = 0.00;

-- Zerar baús do tesouro
UPDATE public.treasure_chests 
SET 
  prize_amount = 0.00;

-- Zerar transações administrativas de saldo
UPDATE public.admin_balance_transactions 
SET 
  amount_before = 0.00,
  amount_after = 0.00,
  amount_changed = 0.00,
  updated_at = now();