-- Remover validação obrigatória do código de referência
-- Execute este código no SQL Editor do Supabase

-- 1. Remover trigger atual
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile_definitive();

-- 2. Criar função sem validação de código de referência
CREATE OR REPLACE FUNCTION create_user_profile_no_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
        RETURN NEW;
    END IF;
    
    -- Inserir perfil básico sem validação de código
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        referral_code,
        role,
        balance,
        total_profit,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'Usuário',
        split_part(NEW.email, '@', 1),
        'Novo usuário',
        'avatar1',
        COALESCE(NEW.raw_user_meta_data->>'referral_code', 'souzamkt0'),
        'user',
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der qualquer erro, apenas retorna sem falhar
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_no_validation();

-- 4. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 5. Verificar se o admin souzamkt0 existe
SELECT 
    'Admin Souza' as info,
    u.id,
    u.email,
    p.username,
    p.referral_code,
    p.role,
    CASE 
        WHEN p.user_id IS NOT NULL THEN '✅ Admin configurado'
        ELSE '❌ Admin não configurado'
    END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 6. Criar perfil do admin se não existir
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    referral_code,
    role,
    balance,
    total_profit,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'Administrador do sistema',
    'avatar1',
    'souzamkt0',
    'admin',
    0.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- 7. Verificar se há usuários sem perfil
SELECT 
    'Usuários sem perfil' as info,
    COUNT(*) as total_sem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 8. Criar perfis para usuários que não têm
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    referral_code,
    role,
    balance,
    total_profit,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Usuário',
    split_part(u.email, '@', 1),
    'Novo usuário',
    'avatar1',
    'souzamkt0',
    'user',
    0.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 9. Resumo final
SELECT 
    'VALIDAÇÃO REMOVIDA' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as trigger_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users u LEFT JOIN profiles p ON u.id = p.user_id WHERE p.user_id IS NULL) = 0 THEN '✅ Todos os usuários têm perfil'
        ELSE '❌ Há usuários sem perfil'
    END as perfis_status,
    'Código de referência agora é opcional' as status;



