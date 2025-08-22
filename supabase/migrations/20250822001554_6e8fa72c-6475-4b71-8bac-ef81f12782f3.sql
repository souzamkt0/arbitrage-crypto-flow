-- Adicionar foreign key que está faltando entre user_investments e profiles
ALTER TABLE user_investments 
ADD CONSTRAINT user_investments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Adicionar foreign key entre admin_balance_transactions e profiles  
ALTER TABLE admin_balance_transactions 
ADD CONSTRAINT admin_balance_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE admin_balance_transactions 
ADD CONSTRAINT admin_balance_transactions_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) REFERENCES profiles(user_id);