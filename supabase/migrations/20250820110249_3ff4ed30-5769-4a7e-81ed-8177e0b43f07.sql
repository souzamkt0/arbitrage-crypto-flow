-- Adicionar souzamkt0@gmail.com como sócio
INSERT INTO partners (
    user_id,
    email,
    display_name,
    commission_percentage,
    status
)
SELECT 
    p.user_id,
    p.email,
    p.display_name,
    1.00,
    'active'
FROM profiles p
WHERE p.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM partners pt WHERE pt.email = 'souzamkt0@gmail.com'
);

-- Atualizar o role do usuário para partner se ele existir
UPDATE profiles 
SET role = 'partner'
WHERE email = 'souzamkt0@gmail.com';

-- Verificar se foi criado
SELECT email, display_name, commission_percentage, status 
FROM partners 
WHERE email = 'souzamkt0@gmail.com';