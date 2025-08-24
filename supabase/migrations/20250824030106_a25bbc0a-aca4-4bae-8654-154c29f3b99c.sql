-- Remover a função existente e recriar com a estrutura correta
DROP FUNCTION IF EXISTS public.admin_get_all_investments();

-- Recriar a função com os campos corretos da tabela user_investments
CREATE OR REPLACE FUNCTION public.admin_get_all_investments()
RETURNS TABLE (
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
SET search_path = public
AS $$
BEGIN
    -- Verificar se o usuário é admin usando a função is_admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Apenas administradores podem visualizar todos os investimentos';
    END IF;

    RETURN QUERY
    SELECT 
        ui.id as investment_id,
        p.email as user_email,
        COALESCE(p.display_name, p.username, split_part(p.email, '@', 1)) as user_name,
        ip.name as plan_name,
        ui.amount,
        ui.daily_rate,
        COALESCE(ui.total_earned, 0) as total_earned,
        COALESCE(ui.status, 'active') as status,
        ui.created_at,
        GREATEST(0, 
          CASE 
            WHEN ui.end_date IS NOT NULL THEN 
              EXTRACT(DAYS FROM (ui.end_date - NOW()))::INTEGER
            WHEN ip.duration_days IS NOT NULL THEN 
              GREATEST(0, ip.duration_days - EXTRACT(DAYS FROM (NOW() - ui.created_at))::INTEGER)
            ELSE 30 -- default 30 days if no duration found
          END
        ) as days_remaining
    FROM user_investments ui
    INNER JOIN profiles p ON ui.user_id = p.user_id
    INNER JOIN investment_plans ip ON ui.plan_id = ip.id
    WHERE ui.status = 'active' OR ui.status IS NULL
    ORDER BY ui.created_at DESC;
END;
$$;