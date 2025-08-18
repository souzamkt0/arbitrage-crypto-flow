-- Confirmar emails de usuários no Supabase (Versão Simples e Funcional)
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar usuários não confirmados
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Não confirmado'
        ELSE '✅ Confirmado'
    END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. Contar usuários por status
SELECT 
    'Resumo de Usuários' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados,
    ROUND((COUNT(email_confirmed_at)::DECIMAL / COUNT(*)) * 100, 2) as percentual_confirmados
FROM auth.users;

-- 3. Confirmar emails de TODOS os usuários não confirmados
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 4. Verificar resultado após confirmação
SELECT 
    'Após Confirmação' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados,
    ROUND((COUNT(email_confirmed_at)::DECIMAL / COUNT(*)) * 100, 2) as percentual_confirmados
FROM auth.users;

-- 5. Listar usuários confirmados recentemente
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    '✅ Confirmado' as status
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY email_confirmed_at DESC 
LIMIT 10;

-- 6. Criar função para confirmar email automaticamente em novos cadastros
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente para novos usuários
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Aplicar trigger na tabela auth.users (se não existir)
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_new_users();

-- 8. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'auto_confirm_email_trigger';

-- 9. Status final
SELECT 
    '✅ CONFIGURAÇÃO CONCLUÍDA' as status,
    'Todos os emails foram confirmados e novos usuários serão confirmados automaticamente' as descricao;



