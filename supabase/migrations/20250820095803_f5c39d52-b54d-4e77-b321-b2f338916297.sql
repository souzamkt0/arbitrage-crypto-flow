-- CORREÇÃO ULTRA-AGRESSIVA DOS CAMPOS RESISTENTES
-- Forçar diretamente os campos que resistem à correção

-- Forçar valores diretamente
UPDATE auth.users 
SET 
    email_change_token_new = '',
    email_change_token_current = '',
    confirmation_token = '',
    recovery_token = '',
    reauthentication_token = ''
WHERE id = 'c4857c90-5b12-4185-8fdd-36d533c890e9';

-- Se isso não funcionar, vou tentar uma abordagem diferente
-- Criar um novo usuário completamente limpo
DO $$
DECLARE
    current_user_exists BOOLEAN;
BEGIN
    -- Verificar se o usuário ainda tem problemas
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'admin@final.com' 
        AND (email_change_token_new IS NULL OR email_change_token_current IS NULL)
    ) INTO current_user_exists;
    
    -- Se ainda há problemas, criar um usuário novo e limpo
    IF current_user_exists THEN
        -- Remover usuário problemático
        DELETE FROM profiles WHERE email = 'admin@final.com';
        DELETE FROM auth.users WHERE email = 'admin@final.com';
        
        -- Criar usuário completamente novo
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change_token_current,
            reauthentication_token,
            phone_change,
            phone_change_token,
            email_change,
            email_change_confirm_status,
            is_sso_user,
            is_anonymous,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000'::uuid,
            'admin@clean.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            0,
            false,
            false,
            '{}'::jsonb,
            '{}'::jsonb
        );
        
        -- Criar perfil correspondente
        INSERT INTO profiles (
            user_id,
            email,
            display_name,
            role,
            status,
            email_verified,
            profile_completed
        ) SELECT 
            id,
            'admin@clean.com',
            'Admin Clean',
            'admin',
            'active',
            true,
            true
        FROM auth.users WHERE email = 'admin@clean.com';
        
        RAISE NOTICE 'Novo usuário limpo criado: admin@clean.com / 123456';
    ELSE
        RAISE NOTICE 'Usuário original corrigido com sucesso';
    END IF;
END $$;

-- Verificação final
SELECT 
    'RESULTADO FINAL' as status,
    email,
    'Usar senha: 123456' as credenciais,
    confirmation_token = '' as confirmation_ok,
    recovery_token = '' as recovery_ok,
    email_change_token_new = '' as change_new_ok,
    email_change_token_current = '' as change_current_ok
FROM auth.users 
WHERE email IN ('admin@final.com', 'admin@clean.com')
ORDER BY email;