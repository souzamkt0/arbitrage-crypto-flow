-- Desabilitar confirmação de email no Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar configurações atuais
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%email%';

-- 2. Desabilitar confirmação de email
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_signup';

-- 3. Desabilitar confirmação de email para novos usuários
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_confirmations';

-- 4. Configurar para não exigir confirmação de email
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'require_email_confirmation';

-- 5. Verificar se as alterações foram aplicadas
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%email%' OR name LIKE '%signup%' OR name LIKE '%confirm%';

-- 6. Alternativa: Configurar via RPC (se disponível)
-- SELECT set_config('auth.enable_signup', 'false', false);
-- SELECT set_config('auth.enable_confirmations', 'false', false);

-- 7. Verificar usuários existentes que não confirmaram email
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
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Opcional: Confirmar emails de usuários existentes (se necessário)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;

-- 9. Verificar configurações finais
SELECT 
    'Configuração Atual' as info,
    name,
    value
FROM auth.config 
WHERE name IN ('enable_signup', 'enable_confirmations', 'require_email_confirmation');


