-- Teste do sistema completo
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar status atual do sistema
SELECT 
    'Status Atual' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger ativo'
        ELSE '❌ Trigger inativo'
    END as trigger_status;

-- 2. Verificar se o admin souzamkt0 está configurado
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

-- 3. Verificar se o código souzamkt0 pode ser encontrado
SELECT 
    'Busca por souzamkt0' as info,
    p.user_id,
    p.email,
    p.username,
    p.referral_code,
    CASE 
        WHEN p.username = 'souzamkt0' OR p.referral_code = 'souzamkt0' THEN '✅ Código encontrado'
        ELSE '❌ Código não encontrado'
    END as status
FROM profiles p
WHERE p.username = 'souzamkt0' OR p.referral_code = 'souzamkt0';

-- 4. Verificar perfis recentes
SELECT 
    'Perfis Recentes' as info,
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
ORDER BY p.created_at DESC
LIMIT 5;

-- 5. Verificar referrals existentes
SELECT 
    'Referrals Existentes' as info,
    r.id,
    r.referral_code,
    r.commission_rate,
    r.status,
    referrer.email as referrer_email,
    referred.email as referred_email,
    r.created_at
FROM referrals r
LEFT JOIN profiles referrer ON r.referrer_id = referrer.user_id
LEFT JOIN profiles referred ON r.referred_id = referred.user_id
ORDER BY r.created_at DESC
LIMIT 5;

-- 6. Teste de busca por código de indicação (simular frontend)
SELECT 
    'Teste de Busca Frontend' as info,
    'souzamkt0' as codigo_teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE username = 'souzamkt0' OR referral_code = 'souzamkt0'
        ) THEN '✅ Código válido'
        ELSE '❌ Código inválido'
    END as resultado;

-- 7. Verificar se há usuários sem referral_code
SELECT 
    'Usuários sem referral_code' as info,
    COUNT(*) as total_sem_referral_code
FROM profiles 
WHERE referral_code IS NULL;

-- 8. Verificar se há usuários sem referred_by
SELECT 
    'Usuários sem referred_by' as info,
    COUNT(*) as total_sem_referred_by
FROM profiles 
WHERE referred_by IS NULL;

-- 9. Resumo para teste no frontend
SELECT 
    'PRONTO PARA TESTE' as info,
    '1. Acesse a página de registro' as passo1,
    '2. Use código: souzamkt0' as passo2,
    '3. Preencha todos os campos' as passo3,
    '4. Clique em "Criar conta"' as passo4,
    '5. Verifique se não há erro' as passo5,
    '6. Verifique se aparece na seção de indicações' as passo6;

-- 10. Verificar se o sistema está pronto
SELECT 
    'SISTEMA PRONTO' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles WHERE username = 'souzamkt0' OR referral_code = 'souzamkt0') > 0 THEN '✅ Código de indicação disponível'
        ELSE '❌ Código de indicação não encontrado'
    END as codigo_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger funcionando'
        ELSE '❌ Trigger não funcionando'
    END as trigger_status,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') = false THEN '✅ RLS desabilitado'
        ELSE '❌ RLS habilitado'
    END as rls_status,
    'Teste o cadastro agora!' as instrucao;
