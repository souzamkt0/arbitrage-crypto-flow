-- Primeiro, vamos remover as funções existentes
DROP FUNCTION IF EXISTS get_user_active_investments(uuid);
DROP FUNCTION IF EXISTS get_user_active_investments();

-- Criar a função corrigida
CREATE OR REPLACE FUNCTION get_user_active_investments(target_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    amount numeric,
    daily_rate numeric,
    total_earned numeric,
    today_earnings numeric,
    operations_completed integer,
    total_operations integer,
    days_remaining integer,
    status text,
    plan_name text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se target_user_id for fornecido, usar ele, senão usar auth.uid()
    IF target_user_id IS NULL THEN
        target_user_id := auth.uid();
    END IF;
    
    -- Verificar se o usuário está autenticado
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

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
        ui.status::text,
        ip.name as plan_name,
        ui.start_date,
        ui.end_date,
        ui.created_at
    FROM user_investments ui
    LEFT JOIN investment_plans ip ON ui.investment_plan_id = ip.id  -- Corrigido: investment_plan_id em vez de plan_id
    WHERE ui.user_id = target_user_id 
    AND ui.status = 'active'
    ORDER BY ui.created_at DESC;
END;
$$;