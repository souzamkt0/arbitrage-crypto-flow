-- Adicionar admin@clean.com como sócio ativo
INSERT INTO partners (
    user_id,
    email,
    display_name,
    commission_percentage,
    status
) VALUES (
    '3df866ff-b7f7-4f56-9690-d12ff9c10944',
    'admin@clean.com',
    'Administrador',
    1.00,
    'active'
);

-- Atualizar o role do usuário para partner se não for admin
UPDATE profiles 
SET role = 'admin'  -- Mantém como admin
WHERE user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944' AND email = 'admin@clean.com';