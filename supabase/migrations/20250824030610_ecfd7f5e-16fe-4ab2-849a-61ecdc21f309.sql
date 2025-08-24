-- Remover função existente e criar nova
DROP FUNCTION IF EXISTS public.admin_cancel_user_investment(uuid, text);

-- Criar função para administradores cancelarem investimentos individuais
CREATE OR REPLACE FUNCTION public.admin_cancel_user_investment(
    investment_id_param uuid,
    admin_reason text DEFAULT 'Cancelado pelo administrador'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    investment_record RECORD;
    result json;
BEGIN
    -- Verificar se o usuário é admin usando a função is_admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Apenas administradores podem cancelar investimentos';
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