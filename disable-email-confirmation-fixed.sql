-- Desabilitar confirmação de email no Supabase (Versão Corrigida)
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar estrutura das tabelas de autenticação
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;

-- 2. Verificar configurações de autenticação
SELECT 
    name,
    value,
    description
FROM auth.settings 
WHERE name LIKE '%email%' OR name LIKE '%signup%' OR name LIKE '%confirm%';

-- 3. Verificar usuários não confirmados
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

-- 4. Confirmar emails de usuários existentes (método direto)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 5. Verificar resultado da confirmação
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- 6. Configurar trigger para confirmar emails automaticamente (opcional)
-- Este trigger confirmará automaticamente emails de novos usuários
CREATE OR REPLACE FUNCTION confirm_email_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela auth.users
DROP TRIGGER IF EXISTS auto_confirm_email ON auth.users;
CREATE TRIGGER auto_confirm_email
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION confirm_email_on_signup();

-- 7. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users';

-- 8. Verificar configurações finais
SELECT 
    'Configuração Atual' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    ROUND((COUNT(email_confirmed_at)::DECIMAL / COUNT(*)) * 100, 2) as percentual_confirmados
FROM auth.users;
