-- Agora adicionar as foreign keys com os dados limpos
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

-- Atualizar RLS policy para profiles permitir que usuários vejam seu próprio perfil e admins vejam todos
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT USING (
  auth.uid() = user_id OR is_admin(auth.uid())
);