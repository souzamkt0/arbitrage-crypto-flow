-- Criar função para remover sócio que funciona com o sistema de bypass
CREATE OR REPLACE FUNCTION public.remove_partner_by_admin(
    partner_email text,
    admin_email text DEFAULT 'admin@clean.com'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    partner_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se o admin_email é um dos admins permitidos
    IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email de admin não autorizado'
        );
    END IF;

    -- Verificar se o admin existe na tabela profiles
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = admin_email 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Admin não encontrado ou sem permissão'
        );
    END IF;

    -- Buscar o user_id do sócio
    SELECT user_id INTO partner_user_id
    FROM partners 
    WHERE email = partner_email;

    -- Se não encontrou o sócio
    IF partner_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Sócio não encontrado'
        );
    END IF;

    -- Remover da tabela partners
    DELETE FROM partners WHERE email = partner_email;

    -- Atualizar o role do usuário para user (se existir user_id)
    IF partner_user_id IS NOT NULL THEN
        UPDATE profiles 
        SET role = 'user'
        WHERE user_id = partner_user_id;
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Sócio removido com sucesso',
        'email', partner_email,
        'admin_used', admin_email
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Dar permissão para uso público da função
GRANT EXECUTE ON FUNCTION public.remove_partner_by_admin(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_partner_by_admin(text, text) TO anon;