-- Teste de criação de usuário manual
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se o trigger está funcionando
SELECT 
    'Trigger status' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT 
    'Função status' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 3. Testar inserção manual na tabela profiles
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste@exemplo.com',
    'Usuário Teste',
    'teste',
    'Usuário de teste',
    'avatar1',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção' as info,
    COUNT(*) as total_profiles
FROM profiles 
WHERE email = 'teste@exemplo.com';

-- 5. Limpar teste
DELETE FROM profiles WHERE email = 'teste@exemplo.com';

-- 6. Verificar RLS da tabela profiles
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. Verificar políticas RLS
SELECT 
    'Políticas RLS' as info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Criar política RLS para permitir inserção
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Verificar se a política foi criada
SELECT 
    'Política criada' as info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles'
AND policyname = 'Enable insert for authenticated users only';

-- 10. Testar função handle_new_user manualmente
-- SELECT handle_new_user();

-- 11. Verificar logs de erro recentes
SELECT 
    'Logs recentes' as info,
    log_time,
    log_level,
    log_message
FROM pg_stat_activity 
WHERE application_name LIKE '%supabase%'
AND state = 'active'
ORDER BY query_start DESC
LIMIT 10;
