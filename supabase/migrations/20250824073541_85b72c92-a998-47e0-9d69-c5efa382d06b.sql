-- Zerar saldo do usuário admin@clean.com
UPDATE profiles 
SET balance = 0.00, updated_at = NOW()
WHERE user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944';