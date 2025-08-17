-- Função RPC para confirmar email de usuário
-- Execute este código no SQL Editor do Supabase

-- Criar função para confirmar email de um usuário específico
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;

    -- Confirmar email do usuário
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = user_id;

    -- Verificar se foi atualizado
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erro ao confirmar email'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Email confirmado com sucesso',
        'user_id', user_id,
        'confirmed_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO authenticated;

-- Testar a função
-- SELECT confirm_user_email('user-id-aqui');

-- Função para confirmar todos os emails não confirmados
CREATE OR REPLACE FUNCTION confirm_all_emails()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_count INTEGER;
    result JSON;
BEGIN
    -- Confirmar todos os emails não confirmados
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email_confirmed_at IS NULL;

    GET DIAGNOSTICS affected_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'message', 'Emails confirmados com sucesso',
        'affected_count', affected_count,
        'confirmed_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION confirm_all_emails() TO authenticated;

-- Testar a função
-- SELECT confirm_all_emails();

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('confirm_user_email', 'confirm_all_emails');
