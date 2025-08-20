-- CORREÇÃO DEFINITIVA DOS CAMPOS NULL PROBLEMÁTICOS
-- O erro "Database error querying schema" é causado por campos NULL que deveriam ser strings vazias

-- 1. Corrigir todos os campos de token que estão NULL
UPDATE auth.users 
SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    email_change = COALESCE(email_change, ''),
    phone = COALESCE(phone, NULL), -- Este pode ser NULL
    instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
    aud = COALESCE(aud, 'authenticated'),
    role = COALESCE(role, 'authenticated'),
    email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
    is_sso_user = COALESCE(is_sso_user, false),
    is_anonymous = COALESCE(is_anonymous, false),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
    updated_at = NOW()
WHERE email = 'admin@final.com';

-- 2. Verificar resultado da correção
SELECT 
    'USUÁRIO CORRIGIDO' as status,
    email,
    confirmation_token = '' as confirmation_ok,
    recovery_token = '' as recovery_ok,
    email_change_token_new = '' as change_new_ok,
    email_change_token_current = '' as change_current_ok,
    reauthentication_token = '' as reauth_ok,
    instance_id IS NOT NULL as instance_ok,
    aud,
    role,
    'Todos os campos corrigidos - login deve funcionar agora' as resultado
FROM auth.users 
WHERE email = 'admin@final.com';