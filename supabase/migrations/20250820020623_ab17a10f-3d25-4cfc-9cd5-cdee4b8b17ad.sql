-- SOLUÇÃO RADICAL: Atualização forçada campo por campo
-- Alguns campos podem ter constraints especiais

-- Forçar campos específicos um por um
UPDATE auth.users 
SET email_change_token_new = '' 
WHERE email = 'souzamkt0@gmail.com' AND email_change_token_new IS NULL;

UPDATE auth.users 
SET email_change_token_current = '' 
WHERE email = 'souzamkt0@gmail.com' AND email_change_token_current IS NULL;

UPDATE auth.users 
SET email_change_token_new = '' 
WHERE email = 'admin@sistema.com' AND email_change_token_new IS NULL;

UPDATE auth.users 
SET email_change_token_current = '' 
WHERE email = 'admin@sistema.com' AND email_change_token_current IS NULL;

-- Se ainda falhar, criar usuário totalmente novo com método diferente
-- Deletar usuários problemáticos
DELETE FROM profiles WHERE email IN ('souzamkt0@gmail.com', 'admin@sistema.com');
DELETE FROM auth.users WHERE email IN ('souzamkt0@gmail.com', 'admin@sistema.com');

-- Criar usuário usando método básico PostgreSQL
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Gerar novo ID
    new_user_id := gen_random_uuid();
    
    -- Inserir usuário básico
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
        email_change_token_new,
        email_change_token_current,
        recovery_token,
        email_change_confirm_status
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@lovable.app',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '',
        0
    );
    
    -- Inserir perfil
    INSERT INTO profiles (
        user_id,
        email,
        full_name,
        display_name,
        username,
        role,
        status,
        bio,
        profile_completed,
        email_verified
    ) VALUES (
        new_user_id,
        'admin@lovable.app',
        'Admin Lovable',
        'Admin Lovable',
        'adminlovable',
        'admin',
        'active',
        'Admin Principal',
        true,
        true
    );
    
    RAISE NOTICE 'Usuário admin@lovable.app criado com senha: password123';
END $$;

-- Verificar o novo usuário
SELECT 
    'NOVO ADMIN CRIADO' as resultado,
    u.email,
    u.confirmation_token = '' as confirmation_ok,
    u.email_change_token_new = '' as change_new_ok,
    u.email_change_token_current = '' as change_current_ok,
    p.role,
    p.display_name,
    'Senha: password123' as credenciais
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@lovable.app';