-- CORRIGIR SENHA DO ADMIN - Usar método correto do Supabase
-- O Supabase pode ter requisitos específicos para hash de senha

-- 1. Atualizar senha usando função do Supabase
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'souzamkt0@gmail.com';

-- 2. Verificar se foi atualizada
SELECT 
    'Senha Atualizada' as info,
    email,
    LENGTH(encrypted_password) as password_length,
    updated_at,
    '✅ TESTE LOGIN NOVAMENTE' as instrucao
FROM auth.users 
WHERE email = 'souzamkt0@gmail.com';