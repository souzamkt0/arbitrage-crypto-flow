-- Verificar e corrigir status do admin souzamkt0 (Estrutura Real)
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o usuário souzamkt0 existe
SELECT 
    'Verificação do Admin Souza' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        ELSE '✅ Email confirmado'
    END as status_email
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';

-- 2. Verificar perfil do admin souzamkt0 (estrutura real)
SELECT 
    'Perfil do Admin Souza' as info,
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 3. Confirmar email do admin souzamkt0 (se não estiver confirmado)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'souzamkt0@gmail.com' 
AND email_confirmed_at IS NULL;

-- 4. Se o perfil não existir, criar um (estrutura real)
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Souza',
    'souzamkt0',
    'Administrador do Sistema',
    'avatar1',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.email = 'souzamkt0@gmail.com'
);

-- 5. Verificar se existe tabela de roles ou configurações de admin
SELECT 
    'Verificar tabelas de configuração' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%role%' OR table_name LIKE '%admin%' OR table_name LIKE '%config%'
ORDER BY table_name;

-- 6. Verificar se existe coluna role em alguma tabela
SELECT 
    'Verificar colunas role' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name LIKE '%role%'
ORDER BY table_name, column_name;

-- 7. Verificar se o admin está na tabela partners
SELECT 
    'Admin Souza na tabela Partners' as info,
    id,
    user_id,
    email,
    display_name,
    commission_percentage,
    status,
    created_at
FROM partners 
WHERE email = 'souzamkt0@gmail.com';

-- 8. Se não estiver na tabela partners, adicionar
INSERT INTO partners (
    user_id,
    email,
    display_name,
    commission_percentage,
    status,
    created_at,
    updated_at
)
SELECT 
    p.user_id,
    p.email,
    p.display_name,
    1.00,
    'active',
    NOW(),
    NOW()
FROM profiles p
WHERE p.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM partners pt WHERE pt.email = 'souzamkt0@gmail.com'
);

-- 9. Verificar resultado final
SELECT 
    'Status Final do Admin Souza' as info,
    u.id,
    u.email,
    u.email_confirmed_at,
    p.display_name,
    p.username,
    pt.status as partner_status,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND p.user_id IS NOT NULL 
        AND pt.status = 'active' THEN '✅ Admin Ativo'
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        WHEN p.user_id IS NULL THEN '❌ Perfil não existe'
        WHEN pt.status != 'active' THEN '❌ Partner inativo'
        ELSE '⚠️ Status desconhecido'
    END as status_final
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN partners pt ON u.email = pt.email
WHERE u.email = 'souzamkt0@gmail.com';

-- 10. Criar função para verificar se é admin (baseado em email)
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se é o admin principal
    IF user_email = 'souzamkt0@gmail.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se está na tabela partners
    IF EXISTS (
        SELECT 1 FROM partners 
        WHERE email = user_email 
        AND status = 'active'
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 11. Testar função de admin
SELECT 
    'Teste da função is_admin_user' as info,
    is_admin_user('souzamkt0@gmail.com') as souza_is_admin,
    is_admin_user('outro@email.com') as outro_is_admin;
