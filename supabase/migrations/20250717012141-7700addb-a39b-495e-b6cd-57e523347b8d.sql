-- DADOS INICIAIS PARA TESTE

-- 1. PLANOS DE INVESTIMENTO PADRÃO
INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration_days, description, status) VALUES
('Alphabot Básico', 0.3, 100, 1000, 30, 'Bot básico para iniciantes. Operações simples com baixo risco.', 'active'),
('Alphabot Intermediário', 0.5, 500, 5000, 45, 'Bot intermediário com estratégias moderadas de arbitragem.', 'active'),
('Alphabot Avançado', 1.0, 1000, 10000, 60, 'Bot avançado com múltiplas estratégias de trading.', 'active'),
('Alphabot Premium', 1.6, 5000, 25000, 75, 'Bot premium com algoritmos otimizados para máximo retorno.', 'active'),
('Alphabot VIP', 2.0, 10000, 100000, 90, 'Bot VIP com as melhores estratégias disponíveis.', 'active');

-- 2. CONFIGURAÇÕES ADMINISTRATIVAS PADRÃO
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('referral_percentage', '5', 'Percentual de comissão por indicação'),
('residual_percentage', '10', 'Percentual de ganhos residuais'),
('allow_referrals', 'true', 'Permitir sistema de indicações'),
('allow_residuals', 'true', 'Permitir ganhos residuais'),
('allow_gamification', 'true', 'Permitir gamificação da comunidade'),
('post_reward', '0.003', 'Recompensa por post na comunidade'),
('like_reward', '0.001', 'Recompensa por curtida'),
('comment_reward', '0.002', 'Recompensa por comentário'),
('monthly_limit', '50', 'Limite mensal de ganhos por gamificação'),
('spam_warning', '⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas.', 'Aviso anti-spam'),
('pix_enabled', 'true', 'Habilitar depósitos via PIX'),
('usdt_enabled', 'true', 'Habilitar depósitos via USDT'),
('minimum_deposit', '50', 'Valor mínimo de depósito'),
('maximum_deposit', '10000', 'Valor máximo de depósito'),
('auto_approval', 'false', 'Aprovação automática de depósitos'),
('withdrawal_fee_pix_percent', '2', 'Taxa de saque PIX (%)'),
('withdrawal_fee_usdt_percent', '5', 'Taxa de saque USDT (%)'),
('pix_daily_limit', '2000', 'Limite diário PIX'),
('usdt_daily_limit', '10000', 'Limite diário USDT'),
('withdrawal_processing_hours', '09:00-17:00', 'Horário de processamento de saques'),
('withdrawal_business_days', 'true', 'Processar saques apenas em dias úteis'),
('treasure_chest_min_deposit', '50', 'Depósito mínimo para baús de tesouro'),
('treasure_chests_per_deposit', '3', 'Quantidade de baús por depósito'),
('treasure_chest_prizes', '[1, 2, 3, 5, 8, 10, 15, 20, 25, 30]', 'Prêmios disponíveis nos baús');

-- 3. DADOS DE MERCADO INICIAIS
INSERT INTO public.market_data (symbol, price, volume_24h, change_24h, high_24h, low_24h, market_cap, rank) VALUES
('BTC', 67420.50, 28500000000, 2.34, 68900.00, 65200.00, 1320000000000, 1),
('ETH', 3842.15, 15200000000, 1.87, 3950.00, 3750.00, 462000000000, 2),
('BNB', 315.20, 890000000, -0.45, 318.50, 312.00, 47000000000, 4),
('ADA', 0.4520, 320000000, 3.21, 0.4680, 0.4390, 15800000000, 8),
('SOL', 145.80, 1200000000, 5.67, 152.30, 138.90, 67000000000, 5),
('XRP', 0.5234, 1500000000, -1.23, 0.5420, 0.5180, 29000000000, 6),
('DOGE', 0.1456, 890000000, 8.91, 0.1598, 0.1334, 21000000000, 10),
('MATIC', 0.8901, 450000000, 2.15, 0.9234, 0.8567, 8900000000, 15);

-- 4. ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_investments_user_id ON public.user_investments(user_id);
CREATE INDEX idx_user_investments_status ON public.user_investments(status);
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_trading_history_user_id ON public.trading_history(user_id);
CREATE INDEX idx_trading_history_created_at ON public.trading_history(created_at);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at);
CREATE INDEX idx_post_interactions_user_id ON public.post_interactions(user_id);
CREATE INDEX idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX idx_treasure_chests_user_id ON public.treasure_chests(user_id);
CREATE INDEX idx_market_data_symbol ON public.market_data(symbol);
CREATE INDEX idx_market_data_created_at ON public.market_data(created_at);