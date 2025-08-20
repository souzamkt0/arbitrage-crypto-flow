-- CORREÇÃO COMPLETA: Limpar TODOS os tokens NULL de TODOS os usuários
UPDATE auth.users 
SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
WHERE 
    confirmation_token IS NULL 
    OR email_change_token_new IS NULL 
    OR email_change_token_current IS NULL 
    OR recovery_token IS NULL 
    OR email_change_confirm_status IS NULL;

-- Verificar resultado
SELECT 
    'Correção Final Auth' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) as null_confirmation,
    COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) as null_change_new,
    COUNT(CASE WHEN email_change_token_current IS NULL THEN 1 END) as null_change_current,
    CASE 
        WHEN COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) = 0 
        AND COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) = 0 
        AND COUNT(CASE WHEN email_change_token_current IS NULL THEN 1 END) = 0 
        THEN '✅ TODOS OS TOKENS CORRIGIDOS'
        ELSE '❌ AINDA HÁ TOKENS NULL'
    END as status
FROM auth.users;