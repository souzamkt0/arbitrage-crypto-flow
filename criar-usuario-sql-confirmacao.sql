-- ========================================
-- CRIAR USUÁRIO TESTE COM CONFIRMAÇÃO EMAIL
-- Execute no Supabase SQL Editor
-- ========================================

-- CONFIGURAÇÕES SMTP TITAN EMAIL:
-- Host: smtp.titan.email
-- Port: 587
-- User: suporte@alphabit.vu
-- Password: Jad828657##
-- Sender: noreply@alphabit.vu
-- Encryption: STARTTLS

-- ========================================
-- 1. CRIAR USUÁRIO TESTE DIRETAMENTE
-- ========================================

-- Inserir usuário teste na tabela auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'teste.smtp.confirmacao.' || extract(epoch from now()) || '@alphabit.vu',
    crypt('TesteConfirmacao123!', gen_salt('bf')),
    NULL,  -- Deixar NULL para testar confirmação por email
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
);

-- ========================================
-- 2. VERIFICAR USUÁRIO CRIADO
-- ========================================

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Pendente confirmação'
        ELSE '✅ Email confirmado'
    END as status_confirmacao
FROM auth.users 
WHERE email LIKE '%teste.smtp.confirmacao%'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 3. SIMULAR ENVIO DE EMAIL DE CONFIRMAÇÃO
-- ========================================

-- Para testar o SMTP, você pode:
-- 1. Ir para Authentication > Users no painel Supabase
-- 2. Encontrar o usuário criado
-- 3. Clicar em "Send confirmation email"
-- 4. Verificar se o email chega em suporte@alphabit.vu

-- ========================================
-- 4. CONFIRMAR EMAIL MANUALMENTE (SE NECESSÁRIO)
-- ========================================

-- Se o email não chegar, confirme manualmente:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email LIKE '%teste.smtp.confirmacao%' 
-- AND email_confirmed_at IS NULL;

-- ========================================
-- 5. VERIFICAR RESULTADO FINAL
-- ========================================

SELECT 
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado em ' || email_confirmed_at::text
        ELSE '⏳ Aguardando confirmação'
    END as status_final
FROM auth.users 
WHERE email LIKE '%teste.smtp.confirmacao%'
ORDER BY created_at DESC;

-- ========================================
-- 6. ESTATÍSTICAS DE CONFIRMAÇÃO
-- ========================================

SELECT 
    COUNT(*) as total_usuarios_teste,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as pendentes,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(email_confirmed_at)::decimal / COUNT(*)) * 100, 2)
        ELSE 0
    END as taxa_confirmacao_pct
FROM auth.users 
WHERE email LIKE '%teste%';

-- ========================================
-- 7. LIMPAR USUÁRIOS DE TESTE (OPCIONAL)
-- ========================================

-- CUIDADO: Remove todos os usuários de teste
-- Descomente apenas se necessário:
-- DELETE FROM auth.users 
-- WHERE email LIKE '%teste%' 
--    OR email LIKE '%test%'
--    OR email LIKE '%exemplo%';

-- ========================================
-- INSTRUÇÕES DE TESTE:
-- ========================================

/*
1. EXECUTE A QUERY 1 para criar o usuário teste

2. EXECUTE A QUERY 2 para verificar se foi criado

3. TESTE O SMTP:
   - Vá para Authentication > Users no painel Supabase
   - Encontre o usuário teste criado
   - Clique em "Send confirmation email"
   - Verifique se o email chega em suporte@alphabit.vu

4. SE O EMAIL NÃO CHEGAR:
   - Verifique spam/lixo eletrônico
   - Confirme configurações SMTP no painel
   - Use a query 4 para confirmar manualmente

5. EXECUTE AS QUERIES 5 e 6 para verificar resultados

6. LIMPE OS DADOS DE TESTE com a query 7 quando terminar
*/

-- ========================================
-- CONFIGURAÇÕES SMTP PARA REFERÊNCIA:
-- ========================================

/*
PAINEL SUPABASE - Authentication > Settings > SMTP Settings:

✅ Enable custom SMTP: ON
📧 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587
👤 SMTP User: suporte@alphabit.vu
🔐 SMTP Password: Jad828657##
📤 Sender Email: noreply@alphabit.vu
📝 Sender Name: AlphaBit
🔒 Secure Connection: STARTTLS
*/

-- ========================================
-- SCRIPT FINALIZADO
-- ========================================