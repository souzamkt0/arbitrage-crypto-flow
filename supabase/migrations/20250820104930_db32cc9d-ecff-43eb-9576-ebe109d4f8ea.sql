-- Limpar perfis duplicados e inválidos para admin@clean.com
-- Manter apenas o perfil com user_id válido
DELETE FROM profiles 
WHERE email = 'admin@clean.com' 
AND (user_id IS NULL OR user_id != '3df866ff-b7f7-4f56-9690-d12ff9c10944');

-- Adicionar foreign keys faltando para melhorar as relações entre tabelas
-- Foreign key entre user_investments e profiles
ALTER TABLE user_investments 
ADD CONSTRAINT fk_user_investments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre admin_balance_transactions e profiles  
ALTER TABLE admin_balance_transactions 
ADD CONSTRAINT fk_admin_balance_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE admin_balance_transactions 
ADD CONSTRAINT fk_admin_balance_transactions_admin_user_id 
FOREIGN KEY (admin_user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Atualizar RLS policy para profiles permitir que admins vejam todos os perfis
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- Adicionar policy para admins poderem ver dados de sócios
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_admin(auth.uid()));