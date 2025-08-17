-- Corrigir erro de chave estrangeira
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar constraint de chave estrangeira
SELECT 
    'Verificar constraint' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';

-- 2. Verificar se há usuários na tabela auth.users
SELECT 
    'Usuários existentes' as info,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 3. Listar alguns usuários existentes
SELECT 
    'Usuários disponíveis' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar perfis existentes
SELECT 
    'Perfis existentes' as info,
    COUNT(*) as total_perfis
FROM profiles;

-- 5. Verificar se há perfis órfãos (sem usuário correspondente)
SELECT 
    'Perfis órfãos' as info,
    p.user_id,
    p.email,
    p.created_at,
    CASE 
        WHEN u.id IS NULL THEN '❌ Sem usuário'
        ELSE '✅ Com usuário'
    END as status
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL
ORDER BY p.created_at DESC;

-- 6. Testar inserção com usuário real existente
-- Primeiro, pegar um usuário real
WITH real_user AS (
    SELECT id, email 
    FROM auth.users 
    WHERE email = 'souzamkt0@gmail.com'
    LIMIT 1
)
SELECT 
    'Usuário real para teste' as info,
    id,
    email
FROM real_user;

-- 7. Testar inserção com usuário real (se existir)
-- INSERT INTO profiles (
--     user_id,
--     email,
--     display_name,
--     username,
--     bio,
--     avatar,
--     created_at,
--     updated_at
-- )
-- SELECT 
--     u.id,
--     u.email,
--     'Teste Real',
--     'testereal',
--     'Teste com usuário real',
--     'avatar1',
--     NOW(),
--     NOW()
-- FROM auth.users u
-- WHERE u.email = 'souzamkt0@gmail.com'
-- AND NOT EXISTS (
--     SELECT 1 FROM profiles p WHERE p.user_id = u.id
-- );

-- 8. Verificar trigger atual
SELECT 
    'Trigger atual' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 9. Verificar função atual
SELECT 
    'Função atual' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_user_profile_robust', 'create_user_profile', 'handle_new_user')
ORDER BY routine_name;

-- 10. Recriar função sem usar gen_random_uuid()
CREATE OR REPLACE FUNCTION create_user_profile_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
        RAISE NOTICE 'Perfil já existe para usuário %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Criar perfil usando o user_id real do NEW
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,  -- Usar o ID real do usuário criado
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user'),
        'Novo usuário',
        'avatar1',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_safe();

-- 12. Verificar se foi criado
SELECT 
    'Trigger recriado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 13. Resumo final
SELECT 
    'CONFIGURAÇÃO CORRIGIDA' as info,
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
    'Pronto para testar cadastro real' as status;
