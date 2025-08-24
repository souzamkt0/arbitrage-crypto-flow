-- Corrigir a função admin_get_all_investments para usar a verificação correta de admin
CREATE OR REPLACE FUNCTION public.admin_get_all_investments()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    plan_id uuid,
    amount numeric,
    daily_rate numeric,
    status text,
    created_at timestamp with time zone,
    end_date timestamp with time zone,
    days_remaining integer,
    user_email text,
    user_name text,
    plan_name text
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
        ui.id,
        ui.user_id,
        ui.plan_id,
        ui.amount,
        ui.daily_rate,
        ui.status,
        ui.created_at,
        ui.end_date,
        CASE 
            WHEN ui.end_date > NOW() THEN EXTRACT(DAY FROM ui.end_date - NOW())::integer
            ELSE 0
        END as days_remaining,
        p.email as user_email,
        COALESCE(p.display_name, p.username, p.email) as user_name,
        ip.name as plan_name
    FROM user_investments ui
    JOIN profiles p ON p.user_id = ui.user_id
    LEFT JOIN investment_plans ip ON ip.id = ui.plan_id
    WHERE ui.status = 'active'
    ORDER BY ui.created_at DESC;
END;
$$;