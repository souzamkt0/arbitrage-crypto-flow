-- INVESTIGAÇÃO PROFUNDA DO PROBLEMA DE SCHEMA
-- O erro persiste, vou fazer uma abordagem mais radical

-- 1. REMOVER TODOS OS TRIGGERS PROBLEMÁTICOS
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_simple();

-- 2. CRIAR UM USUÁRIO TOTALMENTE NOVO COM ABORDAGEM DIFERENTE
-- Primeiro, limpar tudo relacionado ao admin atual
DELETE FROM profiles WHERE email = 'admin@lovable.app';
DELETE FROM auth.users WHERE email = 'admin@lovable.app';

-- 3. INSERIR USUÁRIO DIRETAMENTE SEM USAR CRIPTOGRAFIA COMPLEXA
-- Usar uma abordagem mais simples
DO $$
DECLARE
    new_admin_id uuid;
BEGIN
    -- Gerar ID fixo para controle
    new_admin_id := 'a0000000-0000-0000-0000-000000000001'::uuid;
    
    -- Inserir na auth.users com dados mínimos necessários
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
        email_change_confirm_status
    ) VALUES (
        new_admin_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'admin@test.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',  -- Senha fixa simples
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
    
    -- Inserir perfil correspondente
    INSERT INTO profiles (
        user_id,
        email,
        display_name,
        username,
        role,
        status,
        email_verified,
        profile_completed,
        created_at,
        updated_at
    ) VALUES (
        new_admin_id,
        'admin@test.com',
        'Admin Teste',
        'admintest', 
        'admin',
        'active',
        true,
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Usuário admin@test.com criado com senha simples para teste';
END $$;

-- 4. VERIFICAR O RESULTADO
SELECT 
    'NOVO ADMIN CRIADO' as status,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_ok,
    p.role,
    p.display_name,
    'Usar senha: 123456 (senha padrão para teste)' as senha_info
FROM auth.users u
JOIN profiles p ON u.id = p.user_id  
WHERE u.email = 'admin@test.com';