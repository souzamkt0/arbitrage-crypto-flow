-- CORREÇÃO MAIS DIRETA DOS CAMPOS PROBLEMÁTICOS
-- Alguns campos ainda estão NULL, vou corrigi-los diretamente

-- Corrigir campos específicos que ainda estão NULL
UPDATE auth.users 
SET 
    email_change_token_new = '',
    email_change_token_current = ''
WHERE email = 'admin@final.com' 
AND (email_change_token_new IS NULL OR email_change_token_current IS NULL);

-- Verificar se há outros usuários com problemas similares e corrigi-los também
UPDATE auth.users 
SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    instance_id = COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
    aud = COALESCE(aud, 'authenticated'),
    role = COALESCE(role, 'authenticated'),
    updated_at = NOW()
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL 
   OR reauthentication_token IS NULL 
   OR instance_id IS NULL 
   OR aud IS NULL 
   OR role IS NULL;

-- Verificação final completa
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) as confirmation_null,
    COUNT(CASE WHEN recovery_token IS NULL THEN 1 END) as recovery_null,
    COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) as change_new_null,
    COUNT(CASE WHEN email_change_token_current IS NULL THEN 1 END) as change_current_null,
    'Todos os NULLs devem ser 0' as objetivo
FROM auth.users;