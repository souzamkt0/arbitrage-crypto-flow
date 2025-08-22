-- Atualizar o role do usuário dagosaraiva@hotmail.com para admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'dagosaraiva@hotmail.com';

-- Verificar se a atualização foi bem-sucedida
SELECT 
  email,
  role,
  is_admin(user_id) as is_admin_function
FROM profiles 
WHERE email = 'dagosaraiva@hotmail.com';