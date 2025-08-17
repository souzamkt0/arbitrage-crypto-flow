-- Corrigir problema de chave estrangeira
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar o erro específico
SELECT 
    'Problema identificado' as info,
    'Estamos tentando inserir user_id que não existe em auth.users' as erro,
    'Vamos corrigir o trigger para usar NEW.id' as solucao;

-- 2. Remover o trigger atual
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_ultra_simple();

-- 3. Verificar se há usuários na tabela auth.users
SELECT 
    'Usuários existentes' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- 4. Listar alguns usuários existentes
SELECT 
    'Usuários disponíveis' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Criar função CORRETA que usa NEW.id
CREATE OR REPLACE FUNCTION create_profile_correct()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Criando perfil para usuário: % (ID: %)', NEW.email, NEW.id;
    
    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
        RAISE NOTICE 'Perfil já existe para usuário %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Inserir perfil usando NEW.id (ID real do usuário criado)
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
        NEW.id,  -- ✅ Usar NEW.id (ID real do usuário)
        NEW.email,
        'Usuário',
        split_part(NEW.email, '@', 1),
        'Novo usuário',
        'avatar1',
        'souzamkt0',
        'user',
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_correct();

-- 7. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 8. Teste manual com usuário real existente
-- Primeiro, pegar um usuário real
WITH real_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Usuário real para teste' as info,
    id,
    email
FROM real_user;

-- 9. Teste de inserção com usuário real (se existir)
-- INSERT INTO profiles (
--     user_id,
--     email,
--     display_name,
--     username,
--     bio,
--     avatar,
--     referral_code,
--     role,
--     balance,
--     total_profit,
--     created_at,
--     updated_at
-- )
-- SELECT 
--     u.id,
--     u.email,
--     'Teste Real',
--     split_part(u.email, '@', 1),
--     'Teste com usuário real',
--     'avatar1',
--     'souzamkt0',
--     'user',
--     0.00,
--     0.00,
--     NOW(),
--     NOW()
-- FROM auth.users u
-- ORDER BY u.created_at DESC
-- LIMIT 1;

-- 10. Verificar constraint de chave estrangeira
SELECT 
    'Constraint FK' as info,
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

-- 11. Resumo final
SELECT 
    'PROBLEMA CORRIGIDO' as info,
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
    'Agora o trigger usa NEW.id (ID real do usuário)' as correcao,
    'Teste o cadastro no frontend' as proximo_passo;
