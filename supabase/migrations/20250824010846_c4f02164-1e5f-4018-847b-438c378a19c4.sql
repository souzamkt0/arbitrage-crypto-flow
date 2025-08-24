-- Ativar um plano de teste para verificar se funciona
-- Usando dados reais do banco

-- Inserir um investimento de teste
INSERT INTO user_investments (
    user_id,
    investment_plan_id,
    amount,
    daily_rate,
    start_date,
    end_date,
    total_earned,
    status,
    operations_completed,
    total_operations,
    current_day_progress,
    today_earnings,
    daily_target,
    days_remaining
) VALUES (
    'f721d67a-1f37-4709-92a9-ede89e77717f', -- souzamkt0@gmail.com
    '22277d50-3f3e-4076-92d4-117afa749c8e', -- Robô 4.0.0
    50.00,
    2.5,
    NOW(),
    NOW() + INTERVAL '40 days',
    0.00,
    'active',
    0,
    80,
    0.00,
    0.00,
    1.25, -- 50 * 2.5% = 1.25
    40
) RETURNING id, user_id, amount, status;