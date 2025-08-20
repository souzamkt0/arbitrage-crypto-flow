-- SOLUÇÃO FINAL: Deletar usuário problemático e recriar
-- Remover usuário atual que tem tokens corrompidos
DELETE FROM profiles WHERE email = 'souzamkt0@gmail.com';
DELETE FROM auth.users WHERE email = 'souzamkt0@gmail.com';

-- Verificar limpeza
SELECT 
    'Limpeza Completa' as info,
    COUNT(*) as users_restantes,
    'Banco limpo para recriação' as status
FROM auth.users;