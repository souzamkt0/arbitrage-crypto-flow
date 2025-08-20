-- LIMPEZA FORÇADA: Deletar TODOS os registros relacionados
DELETE FROM profiles 
WHERE email = 'souzamkt0@gmail.com' 
   OR id IN (SELECT id FROM auth.users WHERE email = 'souzamkt0@gmail.com')
   OR user_id IN (SELECT id FROM auth.users WHERE email = 'souzamkt0@gmail.com');

DELETE FROM auth.users WHERE email = 'souzamkt0@gmail.com';

-- Verificar se limpeza funcionou
SELECT 'PÓS LIMPEZA' as info, COUNT(*) as profiles_restantes FROM profiles WHERE email = 'souzamkt0@gmail.com';
SELECT 'PÓS LIMPEZA' as info, COUNT(*) as users_restantes FROM auth.users WHERE email = 'souzamkt0@gmail.com';