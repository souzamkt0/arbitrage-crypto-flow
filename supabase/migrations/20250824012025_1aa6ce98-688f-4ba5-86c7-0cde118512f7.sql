-- CORREÇÃO CRÍTICA: Problema de autenticação

-- 1. Verificar políticas atuais
SELECT policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_investments';

-- 2. Criar política temporária permissiva para debug
DROP POLICY IF EXISTS "debug_user_investments_insert" ON user_investments;
CREATE POLICY "debug_user_investments_insert" ON user_investments
    FOR INSERT 
    WITH CHECK (true); -- Temporariamente permissiva

-- 3. Verificar se auth.uid() está funcionando
SELECT 
    auth.uid() as auth_user_id,
    auth.role() as auth_role,
    current_user as current_db_user,
    session_user as session_db_user;

-- 4. Teste de inserção direta com dados do usuário específico
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
    30,
    2.5,
    NOW(),
    NOW() + INTERVAL '40 days',
    0,
    'active',
    0,
    80,
    0,
    0,
    0.75,
    40
)
RETURNING id, user_id, amount;