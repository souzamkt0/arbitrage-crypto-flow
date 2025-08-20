-- Primeiro, limpar perfis duplicados para admin@clean.com
DELETE FROM profiles 
WHERE email = 'admin@clean.com' 
AND (user_id IS NULL OR user_id != '3df866ff-b7f7-4f56-9690-d12ff9c10944');

-- Limpar registros de admin_balance_transactions que referenciam user_ids inexistentes
DELETE FROM admin_balance_transactions 
WHERE user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL)
   OR admin_user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);

-- Limpar registros de user_investments que referenciam user_ids inexistentes  
DELETE FROM user_investments 
WHERE user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);