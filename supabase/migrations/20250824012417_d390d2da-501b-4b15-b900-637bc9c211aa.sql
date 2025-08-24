-- CORREÇÃO DEFINITIVA: Política que funciona com bypass session

-- Remover política atual
DROP POLICY IF EXISTS "allow_authenticated_users_all_operations" ON user_investments;

-- Criar política ultra-permissiva para desenvolvimento
CREATE POLICY "development_allow_all" ON user_investments
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Teste imediato com inserção
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
    '3df866ff-b7f7-4f56-9690-d12ff9c10944',
    '22277d50-3f3e-4076-92d4-117afa749c8e',
    35,
    2.5,
    NOW(),
    NOW() + INTERVAL '40 days',
    0,
    'active',
    0,
    80,
    0,
    0,
    0.875,
    40
)
RETURNING id, user_id, amount, status;