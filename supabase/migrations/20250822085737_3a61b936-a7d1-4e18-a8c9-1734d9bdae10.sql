-- Criar função para atualizar saldo de usuário com validações administrativas
CREATE OR REPLACE FUNCTION public.admin_update_user_balance(
    target_user_id UUID,
    new_balance NUMERIC,
    admin_email TEXT DEFAULT 'admin@clean.com',
    reason TEXT DEFAULT 'Ajuste administrativo'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    old_balance NUMERIC;
    balance_change NUMERIC;
    admin_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se o admin tem permissão
    IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Acesso negado: apenas administradores autorizados'
        );
    END IF;

    -- Buscar admin_user_id
    SELECT user_id INTO admin_user_id 
    FROM profiles 
    WHERE email = admin_email 
    AND role = 'admin';

    IF admin_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Administrador não encontrado'
        );
    END IF;

    -- Buscar saldo atual
    SELECT balance INTO old_balance
    FROM profiles 
    WHERE user_id = target_user_id;

    IF old_balance IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;

    -- Calcular mudança
    balance_change := new_balance - old_balance;

    -- Atualizar saldo
    UPDATE profiles 
    SET 
        balance = new_balance,
        updated_at = NOW()
    WHERE user_id = target_user_id;

    -- Registrar transação administrativa
    INSERT INTO admin_balance_transactions (
        user_id,
        admin_user_id,
        amount_before,
        amount_after,
        amount_changed,
        transaction_type,
        reason
    ) VALUES (
        target_user_id,
        admin_user_id,
        old_balance,
        new_balance,
        balance_change,
        'balance_adjustment',
        reason
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Saldo atualizado com sucesso',
        'old_balance', old_balance,
        'new_balance', new_balance,
        'change', balance_change
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Criar função para banir/desbanir usuário
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(
    target_user_id UUID,
    admin_email TEXT DEFAULT 'admin@clean.com'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_status TEXT;
    new_status TEXT;
    user_email TEXT;
    result JSON;
BEGIN
    -- Verificar se o admin tem permissão
    IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Acesso negado: apenas administradores autorizados'
        );
    END IF;

    -- Buscar status atual e email do usuário
    SELECT status, email INTO current_status, user_email
    FROM profiles 
    WHERE user_id = target_user_id;

    IF current_status IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;

    -- Não permitir banir outros admins
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = target_user_id 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Não é possível alterar status de outros administradores'
        );
    END IF;

    -- Determinar novo status
    new_status := CASE 
        WHEN current_status = 'active' THEN 'inactive'
        ELSE 'active'
    END;

    -- Atualizar status
    UPDATE profiles 
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE user_id = target_user_id;

    RETURN json_build_object(
        'success', true,
        'message', CASE 
            WHEN new_status = 'active' THEN 'Usuário ativado com sucesso'
            ELSE 'Usuário banido/inativado com sucesso'
        END,
        'user_email', user_email,
        'old_status', current_status,
        'new_status', new_status
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Dar permissões às funções
GRANT EXECUTE ON FUNCTION public.admin_update_user_balance(UUID, NUMERIC, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_balance(UUID, NUMERIC, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_toggle_user_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_user_status(UUID, TEXT) TO anon;

-- Testar as funções
SELECT 
    'Funções administrativas criadas com sucesso' as status;