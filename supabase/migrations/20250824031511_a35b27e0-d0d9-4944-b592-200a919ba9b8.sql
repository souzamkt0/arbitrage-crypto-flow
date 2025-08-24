-- Verificar se existe a tabela user_investments e sua estrutura
SELECT 
    'Estrutura user_investments' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT 
    'Dados user_investments' as info,
    COUNT(*) as total_records
FROM user_investments 
WHERE true;

-- Verificar se há investimentos ativos
SELECT 
    'Investimentos ativos' as info,
    ui.*,
    p.email as user_email,
    ip.name as plan_name
FROM user_investments ui
LEFT JOIN profiles p ON ui.user_id = p.user_id
LEFT JOIN investment_plans ip ON ui.investment_plan_id = ip.id
LIMIT 5;

-- Corrigir a função admin_get_all_investments_fixed com tipos corretos
DROP FUNCTION IF EXISTS public.admin_get_all_investments_fixed();

CREATE OR REPLACE FUNCTION public.admin_get_all_investments_fixed()
RETURNS TABLE(
    investment_id uuid, 
    user_email text, 
    user_name text, 
    plan_name text, 
    amount numeric, 
    daily_rate numeric, 
    total_earned numeric, 
    status text, 
    created_at timestamp with time zone, 
    days_remaining integer
)
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
        COALESCE(p.email, 'Email não encontrado')::text as user_email,
        COALESCE(p.display_name, p.username, split_part(p.email, '@', 1), 'Nome não encontrado')::text as user_name,
        COALESCE(ip.name, 'Plano não encontrado')::text as plan_name,
        COALESCE(ui.amount, 0)::numeric as amount,
        COALESCE(ui.daily_rate, 0)::numeric as daily_rate,
        COALESCE(ui.total_earned, 0)::numeric as total_earned,
        COALESCE(ui.status, 'active')::text as status,
        ui.created_at,
        COALESCE(ui.days_remaining, 
          CASE 
            WHEN ui.end_date IS NOT NULL THEN 
              GREATEST(0, EXTRACT(DAYS FROM (ui.end_date - NOW()))::INTEGER)
            WHEN ip.duration_days IS NOT NULL THEN 
              GREATEST(0, ip.duration_days - EXTRACT(DAYS FROM (NOW() - ui.created_at))::INTEGER)
            ELSE 30
          END
        )::integer as days_remaining
    FROM user_investments ui
    INNER JOIN profiles p ON ui.user_id = p.user_id
    LEFT JOIN investment_plans ip ON ui.investment_plan_id = ip.id
    WHERE ui.status = 'active' OR ui.status IS NULL
    ORDER BY ui.created_at DESC;
END;
$$;