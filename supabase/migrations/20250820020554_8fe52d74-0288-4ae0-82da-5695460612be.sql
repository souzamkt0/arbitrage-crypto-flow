-- CORREÇÃO TOTAL: Preencher TODOS os campos NULL que podem causar problemas
UPDATE auth.users 
SET 
    instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'),
    aud = COALESCE(aud, 'authenticated'),
    role = COALESCE(role, 'authenticated'),
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
    phone_change_token = COALESCE(phone_change_token, ''),
    updated_at = NOW()
WHERE email IN ('souzamkt0@gmail.com', 'admin@sistema.com');

-- Verificar se correção funcionou
SELECT 
    'Pós Correção' as info,
    email,
    instance_id IS NOT NULL as instance_ok,
    aud IS NOT NULL as aud_ok,
    role IS NOT NULL as role_ok,
    confirmation_token IS NOT NULL as confirmation_ok,
    email_change_token_new IS NOT NULL as change_new_ok,
    email_change_token_current IS NOT NULL as change_current_ok,
    recovery_token IS NOT NULL as recovery_ok,
    CASE 
        WHEN instance_id IS NOT NULL 
        AND aud IS NOT NULL 
        AND role IS NOT NULL 
        AND confirmation_token IS NOT NULL 
        AND email_change_token_new IS NOT NULL 
        AND email_change_token_current IS NOT NULL 
        AND recovery_token IS NOT NULL 
        THEN '✅ TODOS OS CAMPOS OK'
        ELSE '❌ AINDA HÁ CAMPOS NULL'
    END as status
FROM auth.users 
WHERE email IN ('souzamkt0@gmail.com', 'admin@sistema.com');