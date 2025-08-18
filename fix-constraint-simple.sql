-- Migração simplificada para corrigir a constraint da coluna role
-- Execute este código no SQL Editor do Supabase

-- 1. Remover a constraint existente
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Criar nova constraint que inclui 'partner'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'partner'));

-- 3. Verificar se a alteração foi aplicada
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'profiles_role_check';

-- 4. Testar se Admin Souza pode ser atualizado para partner
UPDATE profiles 
SET role = 'partner' 
WHERE email = 'souzamkt0@gmail.com';

-- 5. Verificar se a atualização funcionou
SELECT user_id, email, role, display_name 
FROM profiles 
WHERE email = 'souzamkt0@gmail.com';

-- 6. Verificar todos os sócios
SELECT user_id, email, role, display_name 
FROM profiles 
WHERE role = 'partner';



