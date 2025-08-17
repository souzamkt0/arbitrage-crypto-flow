-- Teste do sistema de indicação
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar configuração atual
SELECT 
    'Configuração Atual' as info,
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
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'create_user_profile_with_referral'
        ) THEN '✅ Função ativa'
        ELSE '❌ Função inativa'
    END as function_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'referral_code'
        ) THEN '✅ Coluna referral_code existe'
        ELSE '❌ Coluna referral_code não existe'
    END as referral_code_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'referred_by'
        ) THEN '✅ Coluna referred_by existe'
        ELSE '❌ Coluna referred_by não existe'
    END as referred_by_status;

-- 2. Verificar usuários existentes
SELECT 
    'Usuários Existentes' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- 3. Verificar perfis existentes
SELECT 
    'Perfis Existentes' as info,
    COUNT(*) as total_perfis,
    COUNT(referral_code) as com_referral_code,
    COUNT(referred_by) as com_referred_by
FROM profiles;

-- 4. Verificar referrals existentes
SELECT 
    'Referrals Existentes' as info,
    COUNT(*) as total_referrals
FROM referrals;

-- 5. Listar alguns perfis com código de indicação
SELECT 
    'Perfis com Indicação' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    p.referred_by,
    p.whatsapp,
    p.city,
    p.state,
    p.created_at
FROM profiles p
WHERE p.referral_code IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Verificar se o admin souzamkt0 existe
SELECT 
    'Admin Souza' as info,
    u.id,
    u.email,
    u.email_confirmed_at,
    p.username,
    p.referral_code,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';

-- 7. Verificar relacionamentos de indicação
SELECT 
    'Relacionamentos de Indicação' as info,
    r.id,
    r.referral_code,
    r.commission_rate,
    r.status,
    referrer.email as referrer_email,
    referred.email as referred_email,
    r.created_at
FROM referrals r
JOIN profiles referrer ON r.referrer_id = referrer.user_id
JOIN profiles referred ON r.referred_id = referred.user_id
ORDER BY r.created_at DESC
LIMIT 10;

-- 8. Teste de busca por código de indicação
SELECT 
    'Teste de Busca' as info,
    'souzamkt0' as codigo_teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE username = 'souzamkt0' OR referral_code = 'souzamkt0'
        ) THEN '✅ Código encontrado'
        ELSE '❌ Código não encontrado'
    END as resultado;

-- 9. Resumo para teste
SELECT 
    'PRONTO PARA TESTE' as info,
    'Execute o cadastro no frontend' as instrucao,
    'Use código: souzamkt0' as codigo_teste,
    'Verifique console (F12) para logs' as debug,
    'O trigger deve salvar referral_code e dados adicionais' as resultado_esperado;

