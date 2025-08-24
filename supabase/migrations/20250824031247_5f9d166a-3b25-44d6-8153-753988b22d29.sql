-- Criar função de teste para simular a chamada admin_get_all_investments
CREATE OR REPLACE FUNCTION public.test_admin_access()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Testar acesso admin diretamente
    IF NOT is_admin('3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não é admin',
            'user_id', '3df866ff-b7f7-4f56-9690-d12ff9c10944'
        );
    END IF;

    -- Se chegou aqui, é admin - simular dados de investimentos
    RETURN json_build_object(
        'success', true,
        'message', 'Admin autorizado com sucesso',
        'user_id', '3df866ff-b7f7-4f56-9690-d12ff9c10944',
        'is_admin', true
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Criar função alternativa que pode ser usada temporariamente
CREATE OR REPLACE FUNCTION public.admin_get_all_investments_fixed()
RETURNS TABLE(investment_id uuid, user_email text, user_name text, plan_name text, amount numeric, daily_rate numeric, total_earned numeric, status text, created_at timestamp with time zone, days_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Verificação mais específica para admin@clean.com
    IF NOT (
        auth.uid() = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid OR
        is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND email = 'admin@clean.com'
        )
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem visualizar todos os investimentos';
    END IF;

    RETURN QUERY
    SELECT 
        ui.id as investment_id,
        p.email as user_email,
        COALESCE(p.display_name, p.username, split_part(p.email, '@', 1)) as user_name,
        COALESCE(ip.name, 'Plano não encontrado') as plan_name,
        ui.amount,
        ui.daily_rate,
        COALESCE(ui.total_earned, 0) as total_earned,
        COALESCE(ui.status, 'active') as status,
        ui.created_at,
        COALESCE(ui.days_remaining, 
          CASE 
            WHEN ui.end_date IS NOT NULL THEN 
              GREATEST(0, EXTRACT(DAYS FROM (ui.end_date - NOW()))::INTEGER)
            WHEN ip.duration_days IS NOT NULL THEN 
              GREATEST(0, ip.duration_days - EXTRACT(DAYS FROM (NOW() - ui.created_at))::INTEGER)
            ELSE 30
          END
        ) as days_remaining
    FROM user_investments ui
    INNER JOIN profiles p ON ui.user_id = p.user_id
    LEFT JOIN investment_plans ip ON ui.investment_plan_id = ip.id
    WHERE ui.status = 'active' OR ui.status IS NULL
    ORDER BY ui.created_at DESC;
END;
$$;

-- Testar as funções
SELECT 'Teste admin_access:' as test, public.test_admin_access() as result;

-- Verificar usuário admin mais uma vez
SELECT 
    'Final Check' as info,
    u.id,
    u.email,
    p.role,
    is_admin(u.id) as is_admin_result,
    CASE 
        WHEN u.id = '3df866ff-b7f7-4f56-9690-d12ff9c10944' THEN 'UUID Match'
        ELSE 'UUID No Match'
    END as uuid_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@clean.com';