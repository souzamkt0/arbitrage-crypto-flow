-- Configuração SMTP para Titan Email (HostGator)
-- Execute este script no painel do Supabase: Authentication > Settings > SMTP Settings

-- ========================================
-- CONFIGURAÇÕES TITAN EMAIL SMTP
-- ========================================

/*
PARA CONFIGURAR NO PAINEL SUPABASE:

1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix
2. Vá para: Authentication > Settings > SMTP Settings
3. Preencha os campos conforme abaixo:

📧 CONFIGURAÇÕES TITAN EMAIL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587
🔐 Encryption: SSL/TLS ou STARTTLS
👤 SMTP User: suporte@alphabit.vu (conforme mostrado na imagem)
🔑 SMTP Pass: Jad828657##
📧 Sender Name: Arbitrage Crypto Flow
📮 Sender Email: noreply@alphabit.vu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAÇÕES ADICIONAIS:
- Servidor IMAP: imap.titan.email (porta 993, SSL/TLS)
- Servidor SMTP: smtp.titan.email (porta 587, SSL/TLS)
- Protocolo recomendado: IMAP
- Criptografia: SSL/TLS ou STARTTLS

⚠️ IMPORTANTE:
- Use o endereço de email completo como usuário
- Certifique-se de que a conta de email está ativa no Titan
- Teste o envio após configurar

🔧 PASSOS PARA CONFIGURAÇÃO:
1. Crie a conta noreply@alphabit.vu no painel do HostGator/Titan
2. Configure as informações SMTP no Supabase
3. Teste o envio com "Send test email"
4. Execute o SQL abaixo para confirmar usuários existentes (se necessário)
*/

-- ========================================
-- SQL PARA CONFIRMAR USUÁRIOS EXISTENTES
-- ========================================

-- Verificar usuários não confirmados
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
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- Confirmar emails de usuários existentes (execute apenas se necessário)
-- DESCOMENTE A LINHA ABAIXO APENAS SE QUISER CONFIRMAR TODOS OS EMAILS MANUALMENTE
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Verificar resultado após confirmação
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as nao_confirmados
FROM auth.users;

-- ========================================
-- TESTE DE CONFIGURAÇÃO
-- ========================================

/*
APÓS CONFIGURAR O SMTP, TESTE:

1. No painel Supabase:
   - Authentication > Settings > SMTP Settings
   - Clique em "Send test email"
   - Digite um email válido para teste

2. Teste de cadastro:
   - Crie uma nova conta no sistema
   - Verifique se o email de confirmação chega

3. Se não funcionar:
   - Verifique as credenciais do Titan Email
   - Confirme se a conta noreply@alphabit.vu existe
   - Teste as configurações SMTP manualmente
*/

-- ========================================
-- CONFIGURAÇÃO ALTERNATIVA (SE NECESSÁRIO)
-- ========================================

/*
SE PREFERIR DESABILITAR CONFIRMAÇÃO DE EMAIL TEMPORARIAMENTE:

1. No painel Supabase:
   - Authentication > Settings
   - Desmarque "Enable email confirmations"
   - Salve as configurações

2. Execute o SQL de confirmação manual acima

ISSO PERMITIRÁ QUE USUÁRIOS SE CADASTREM SEM CONFIRMAÇÃO DE EMAIL
*/

-- Fim da configuração Titan Email SMTP