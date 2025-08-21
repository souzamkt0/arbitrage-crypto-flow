-- Script para desabilitar confirmação de email no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Atualizar configuração de autenticação para desabilitar confirmação de email
-- IMPORTANTE: Este comando deve ser executado via Dashboard do Supabase
-- Vá para Authentication > Settings e configure:
-- - Enable email confirmations: OFF
-- - Secure email change: OFF
-- - Double confirm email changes: OFF

-- 2. Atualizar usuários existentes para marcar email como confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Verificar se há usuários não confirmados
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 4. Contar usuários confirmados vs não confirmados
SELECT 
    'Confirmados' as status,
    COUNT(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
    'Não Confirmados' as status,
    COUNT(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- Instruções:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Vá para Authentication > Settings no Dashboard
-- 3. Desative "Enable email confirmations"
-- 4. Teste o cadastro novamente