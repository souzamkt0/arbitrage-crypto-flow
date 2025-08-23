-- Corrigir a função RPC para tipos corretos
CREATE OR REPLACE FUNCTION public.get_user_active_investments(target_user_id uuid)
RETURNS TABLE(
    id uuid,
    amount numeric,
    daily_rate numeric,
    total_earned numeric,
    today_earnings numeric,
    operations_completed integer,
    total_operations integer,
    days_remaining integer,
    status character varying,
    plan_name character varying,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ui.id,
        ui.amount,
        ui.daily_rate,
        ui.total_earned,
        ui.today_earnings,
        ui.operations_completed,
        ui.total_operations,
        ui.days_remaining,
        ui.status,
        ip.name as plan_name,
        ui.start_date,
        ui.end_date,
        ui.created_at
    FROM user_investments ui
    LEFT JOIN investment_plans ip ON ui.plan_id = ip.id
    WHERE ui.user_id = target_user_id 
    AND ui.status = 'active'
    ORDER BY ui.created_at DESC;
END;
$function$;