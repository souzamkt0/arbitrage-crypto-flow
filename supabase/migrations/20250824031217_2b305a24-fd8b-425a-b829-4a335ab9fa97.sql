-- Verificar detalhes do usuário admin@clean.com
SELECT 
    'Status atual do admin' as info,
    u.id as auth_user_id,
    u.email as auth_email,
    p.user_id as profile_user_id,
    p.email as profile_email,
    p.role as profile_role,
    is_admin(u.id) as is_admin_result
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@clean.com';

-- Testar diretamente a função is_admin com o UUID
SELECT 
    'Teste direto is_admin' as info,
    is_admin('3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid) as is_admin_hardcoded;

-- Verificar auth.uid() atual (se houver sessão)
SELECT 
    'Context atual' as info,
    auth.uid() as current_auth_uid,
    auth.role() as current_auth_role;

-- Corrigir qualquer problema de perfil
UPDATE profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@clean.com';

-- Inserir perfil se não existir
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    role,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Admin Principal',
    'admin',
    'admin',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'admin@clean.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = u.id
);

-- Verificar resultado final
SELECT 
    'Verificação final' as info,
    u.id,
    u.email,
    p.role,
    is_admin(u.id) as is_admin_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@clean.com';