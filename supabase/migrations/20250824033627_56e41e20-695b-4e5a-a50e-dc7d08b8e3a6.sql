-- Criar função de teste que simula cancelamento sem modificar dados
CREATE OR REPLACE FUNCTION admin_test_cancel_investment(
    investment_id_param uuid,
    admin_reason text DEFAULT 'Teste de cancelamento'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    investment_record RECORD;
    result json;
BEGIN
    -- Buscar o investimento apenas para testar se existe
    SELECT ui.*, p.email as user_email, ip.name as plan_name
    INTO investment_record
    FROM user_investments ui
    LEFT JOIN profiles p ON ui.user_id = p.user_id
    LEFT JOIN investment_plans ip ON ui.investment_plan_id = ip.id
    WHERE ui.id = investment_id_param;

    -- Verificar se o investimento existe
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Investimento não encontrado'
        );
    END IF;

    -- Simular sucesso sem modificar dados
    RETURN json_build_object(
        'success', true,
        'message', 'TESTE: Investimento seria cancelado com sucesso (sem modificação real)',
        'investment_id', investment_id_param,
        'user_email', investment_record.user_email,
        'plan_name', investment_record.plan_name,
        'amount', investment_record.amount,
        'current_status', investment_record.status,
        'reason', admin_reason,
        'mode', 'test_only'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;