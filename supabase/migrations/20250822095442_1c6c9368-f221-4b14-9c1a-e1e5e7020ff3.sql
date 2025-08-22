-- Adicionar foreign key entre digitopay_transactions e profiles
ALTER TABLE digitopay_transactions 
ADD CONSTRAINT digitopay_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);