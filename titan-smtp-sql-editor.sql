-- ========================================
-- CONFIGURAÇÃO TITAN EMAIL SMTP - SQL EDITOR
-- Execute este script no Supabase SQL Editor
-- ========================================

-- Verificar usuários não confirmados
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Não confirmado'
        ELSE 'Confirmado'
    END as status
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ========================================
-- CONFIRMAR EMAILS MANUALMENTE (SE NECESSÁRIO)
-- ========================================

-- DESCOMENTE A LINHA ABAIXO APENAS SE QUISER CONFIRMAR TODOS OS EMAILS MANUALMENTE
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- ========================================
-- VERIFICAR RESULTADO APÓS CONFIRMAÇÃO
-- ========================================

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- ========================================
-- CONFIRMAR EMAIL DE USUÁRIO ESPECÍFICO
-- ========================================

-- Para confirmar um usuário específico, substitua 'email@exemplo.com' pelo email real
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'email@exemplo.com' AND email_confirmed_at IS NULL;

-- ========================================
-- VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ========================================

-- Verificar estrutura da tabela auth.users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar políticas RLS na tabela auth.users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';

-- ========================================
-- LIMPAR USUÁRIOS DE TESTE (OPCIONAL)
-- ========================================

-- CUIDADO: Este comando remove usuários de teste
-- DESCOMENTE APENAS SE NECESSÁRIO E CERTIFIQUE-SE DO QUE ESTÁ FAZENDO
-- DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%exemplo%';

-- ========================================
-- SCRIPT FINALIZADO
-- ========================================

-- Após executar este script:
-- 1. Configure o SMTP no painel Supabase (Authentication > Settings > SMTP Settings)
-- 2. Use as configurações do Titan Email:
--    - SMTP Host: smtp.titan.email
--    - SMTP Port: 587
--    - SMTP User: suporte@alphabit.vu
--    - SMTP Pass: Jad828657##
--    - Sender Email: noreply@alphabit.vu
-- 3. Teste com "Send test email"
-- 4. Teste cadastro de novo usuário