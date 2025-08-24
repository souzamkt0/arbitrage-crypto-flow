-- Corrigir a função admin_cancel_user_investment para verificar permissões corretamente
CREATE OR REPLACE FUNCTION admin_cancel_user_investment(
    investment_id_param uuid,
    admin_reason text DEFAULT 'Cancelado pelo administrador'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    investment_record RECORD;
    result json;
    current_user_email text;
    current_user_role text;
    is_user_admin boolean := false;
BEGIN
    -- Verificar permissões de administrador de forma mais robusta
    SELECT email, role INTO current_user_email, current_user_role
    FROM profiles 
    WHERE user_id = auth.uid();
    
    -- Verificar se é admin por email específico ou role
    IF current_user_email IN ('admin@clean.com', 'souzamkt0@gmail.com') 
       OR current_user_role = 'admin'
       OR auth.uid() = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid THEN
        is_user_admin := true;
    END IF;

    -- Se não é admin, retornar erro
    IF NOT is_user_admin THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas administradores podem cancelar investimentos',
            'debug_info', json_build_object(
                'user_email', current_user_email,
                'user_role', current_user_role,
                'auth_uid', auth.uid()
            )
        );
    END IF;

    -- Buscar o investimento
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

    -- Cancelar o investimento (mudar status para 'cancelled')
    UPDATE user_investments 
    SET 
        status = 'cancelled',
        updated_at = NOW()
    WHERE id = investment_id_param;

    -- Retornar sucesso
    RETURN json_build_object(
        'success', true,
        'message', 'Investimento cancelado com sucesso',
        'investment_id', investment_id_param,
        'user_email', investment_record.user_email,
        'plan_name', investment_record.plan_name,
        'amount', investment_record.amount,
        'reason', admin_reason
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;