-- Confirmar emails manualmente no Supabase
-- Execute este código no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/sql

-- 1. Verificar status atual dos usuários
SELECT 
    '📊 Status Atual' as info,
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

-- 3. CONFIRMAR TODOS OS EMAILS NÃO CONFIRMADOS
-- Esta é a solução principal para o problema
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 4. Verificar resultado após confirmação
SELECT 
    '✅ Status Após Confirmação' as info,
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados,
    CASE 
        WHEN COUNT(*) - COUNT(email_confirmed_at) = 0 THEN '🎉 Todos confirmados!'
        ELSE '⚠️ Ainda há usuários não confirmados'
    END as resultado
FROM auth.users;

-- 5. Listar usuários confirmados recentemente
SELECT 
    '🎉 Usuários Confirmados Agora' as info,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email_confirmed_at >= NOW() - INTERVAL '5 minutes'
ORDER BY email_confirmed_at DESC;

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

-- 7. Criar função para confirmar emails automaticamente (OPCIONAL)
-- Use apenas se quiser que novos usuários sejam confirmados automaticamente
CREATE OR REPLACE FUNCTION auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente para novos usuários
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Aplicar trigger para confirmação automática (DESCOMENTE SE NECESSÁRIO)
-- DROP TRIGGER IF EXISTS auto_confirm_trigger ON auth.users;
-- CREATE TRIGGER auto_confirm_trigger
--     BEFORE INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_confirm_new_users();

-- 9. Verificação final
SELECT 
    '🏁 Resultado Final' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) = 0 
        THEN '🎉 SUCESSO: Todos os emails foram confirmados!'
        ELSE '⚠️ ATENÇÃO: Ainda há emails não confirmados'
    END as status_final,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as confirmados;

-- 10. Instruções para o painel do Supabase
SELECT 
    '📋 PRÓXIMOS PASSOS NO PAINEL' as info,
    'Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix' as url,
    'Authentication > Settings' as navegacao,
    'Desmarque "Enable email confirmations" se quiser desabilitar' as opcao_1,
    'Ou configure SMTP corretamente se quiser manter ativo' as opcao_2,
    'Teste o login após executar este SQL' as teste;