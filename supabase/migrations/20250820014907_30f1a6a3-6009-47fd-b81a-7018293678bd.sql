-- CRITICAL FIX: Corrigir dados corrompidos na tabela auth.users
-- O problema é que confirmation_token e outros campos estão NULL mas o Supabase espera strings

-- Atualizar usuário souzamkt0 para limpar tokens NULL problemáticos
UPDATE auth.users 
SET 
    confirmation_token = '',
    email_change_token_new = '',
    email_change_token_current = '',
    recovery_token = '',
    phone_change_token = '',
    email_change_confirm_status = 0,
    phone_change_confirm_status = 0
WHERE email = 'souzamkt0@gmail.com' 
AND (
    confirmation_token IS NULL 
    OR email_change_token_new IS NULL 
    OR email_change_token_current IS NULL
);

-- Verificar se a correção funcionou
SELECT 
    'Status Correção Auth' as info,
    email,
    confirmation_token IS NOT NULL as token_ok,
    email_confirmed_at IS NOT NULL as email_confirmed,
    CASE 
        WHEN confirmation_token IS NOT NULL 
        AND email_confirmed_at IS NOT NULL THEN '✅ AUTH CORRIGIDO'
        ELSE '❌ AINDA COM PROBLEMA'
    END as status
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';