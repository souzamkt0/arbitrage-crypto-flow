-- Corrigir problema de confirmação de email no Supabase
-- Execute este código no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/sql

-- 1. Verificar usuários não confirmados
SELECT 
    '📊 Status Atual dos Usuários' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados,
    ROUND((COUNT(email_confirmed_at)::DECIMAL / COUNT(*)) * 100, 2) as percentual_confirmados
FROM auth.users;

-- 2. Listar usuários não confirmados
SELECT 
    '❌ Usuários Não Confirmados' as info,
    id,
    email,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Não confirmado'
        ELSE '✅ Confirmado'
    END as status
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 3. SOLUÇÃO: Confirmar emails de TODOS os usuários não confirmados
-- Isso resolve o problema imediatamente para usuários existentes
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 4. Verificar resultado após confirmação
SELECT 
    '✅ Status Após Correção' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados,
    CASE 
        WHEN COUNT(*) - COUNT(email_confirmed_at) = 0 THEN '🎉 Todos confirmados!'
        ELSE '⚠️ Ainda há usuários não confirmados'
    END as resultado
FROM auth.users;

-- 5. Criar trigger para confirmar emails automaticamente (OPCIONAL)
-- Este trigger confirmará automaticamente novos usuários
-- Use apenas se não conseguir desabilitar no painel
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente para novos usuários
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger (descomente se necessário)
-- DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
-- CREATE TRIGGER auto_confirm_email_trigger
--     BEFORE INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_confirm_email();

-- 6. Verificar usuários específicos importantes
SELECT 
    '👤 Usuários Importantes' as info,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
        ELSE '❌ Não confirmado'
    END as status,
    created_at
FROM auth.users 
WHERE email IN ('souzamkt0@gmail.com', 'admin@alphabit.com')
ORDER BY created_at DESC;

-- 7. Instruções finais
SELECT 
    '📋 PRÓXIMOS PASSOS' as info,
    'Após executar este SQL, vá para o painel do Supabase:' as passo_1,
    '1. Authentication > Settings' as passo_2,
    '2. Desmarque "Enable email confirmations"' as passo_3,
    '3. Clique em "Save"' as passo_4,
    'Isso evitará o problema para novos usuários' as observacao;

-- 8. Verificação final
SELECT 
    '🎯 RESUMO FINAL' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) = 0 
        THEN '🎉 PROBLEMA RESOLVIDO: Todos os emails foram confirmados!'
        ELSE '⚠️ ATENÇÃO: Ainda há emails não confirmados'
    END as resultado_final;