-- ========================================
-- TITAN EMAIL SMTP - CONFIGURAÇÃO FUNCIONANDO
-- Execute este script no Supabase SQL Editor
-- ========================================

-- CONFIGURAÇÕES CONFIRMADAS FUNCIONANDO:
-- SMTP Host: smtp.titan.email
-- SMTP Port: 587
-- SMTP User: suporte@alphabit.vu
-- SMTP Pass: Jad828657##
-- Sender Email: noreply@alphabit.vu
-- Sender Name: AlphaBit
-- Encryption: STARTTLS

-- ========================================
-- 1. VERIFICAR STATUS ATUAL DOS USUÁRIOS
-- ========================================

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Pendente confirmação'
        ELSE 'Email confirmado'
    END as status_email,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as horas_desde_criacao
FROM auth.users 
ORDER BY created_at DESC
LIMIT 20;

-- ========================================
-- 2. ESTATÍSTICAS DE CONFIRMAÇÃO DE EMAIL
-- ========================================

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as emails_confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as emails_pendentes,
    ROUND(
        (COUNT(email_confirmed_at)::decimal / COUNT(*)) * 100, 2
    ) as taxa_confirmacao_pct
FROM auth.users;

-- ========================================
-- 3. USUÁRIOS CRIADOS NAS ÚLTIMAS 24 HORAS
-- ========================================

SELECT 
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
        WHEN created_at > NOW() - INTERVAL '1 hour' THEN 'Recente - aguardando'
        ELSE 'Pendente há mais de 1h'
    END as status
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ========================================
-- 4. CONFIRMAR EMAIL MANUALMENTE (SE NECESSÁRIO)
-- ========================================

-- Para confirmar um usuário específico:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'usuario@exemplo.com' AND email_confirmed_at IS NULL;

-- Para confirmar todos os usuários pendentes (USE COM CUIDADO):
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;

-- ========================================
-- 5. VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ========================================

-- Verificar se há políticas RLS que podem estar bloqueando
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';

-- ========================================
-- 6. LIMPAR USUÁRIOS DE TESTE (OPCIONAL)
-- ========================================

-- CUIDADO: Remove usuários de teste
-- Descomente apenas se necessário:
-- DELETE FROM auth.users 
-- WHERE email LIKE '%test%' 
--    OR email LIKE '%teste%' 
--    OR email LIKE '%exemplo%'
--    OR email LIKE '%@test.%';

-- ========================================
-- 7. VERIFICAR ÚLTIMOS LOGS DE ERRO
-- ========================================

-- Se houver tabela de logs, verificar erros recentes:
-- SELECT * FROM auth.audit_log_entries 
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ========================================
-- 8. TESTE DE CRIAÇÃO DE USUÁRIO
-- ========================================

-- Para testar se o SMTP está funcionando, crie um usuário teste:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'teste.smtp.' || extract(epoch from now()) || '@alphabit.vu',
--     crypt('senha123', gen_salt('bf')),
--     NULL,  -- Deixar NULL para testar confirmação por email
--     NOW(),
--     NOW()
-- );

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================

/*
1. CONFIGURAÇÃO NO PAINEL SUPABASE:
   - Vá para Authentication > Settings > SMTP Settings
   - Enable custom SMTP: ON
   - SMTP Host: smtp.titan.email
   - SMTP Port: 587
   - SMTP User: suporte@alphabit.vu
   - SMTP Password: Jad828657##
   - Sender Email: noreply@alphabit.vu
   - Sender Name: AlphaBit
   - Secure Connection: STARTTLS

2. TESTE:
   - Clique em "Send test email" no painel
   - Verifique se o email chegou em suporte@alphabit.vu
   - Teste cadastro de novo usuário

3. MONITORAMENTO:
   - Execute as queries acima regularmente
   - Monitore taxa de confirmação de emails
   - Verifique usuários pendentes

4. TROUBLESHOOTING:
   - Se emails não chegarem, verifique spam/lixo eletrônico
   - Confirme que o domínio alphabit.vu está configurado no Titan
   - Verifique se não há bloqueios de firewall
*/

-- ========================================
-- SCRIPT FINALIZADO - SMTP FUNCIONANDO
-- ========================================