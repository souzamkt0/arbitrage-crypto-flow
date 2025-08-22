-- Remover admin@clean.com da tabela de sócios
DELETE FROM partners WHERE email = 'admin@clean.com';

-- Verificar se foi removido
SELECT 
    'Sócio admin@clean.com removido' as status,
    (SELECT COUNT(*) FROM partners WHERE email = 'admin@clean.com') as count_remaining;

-- Manter admin@clean.com como admin na tabela profiles
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@clean.com';