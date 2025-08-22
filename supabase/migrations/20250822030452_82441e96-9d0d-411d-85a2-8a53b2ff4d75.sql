-- Corrigir foreign key entre user_investments e profiles
-- O erro indica que a relação não existe no schema cache

-- Primeiro, verificar se já existe a foreign key
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_investments';

-- Verificar se a coluna user_id existe em user_investments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_investments' 
AND column_name = 'user_id';

-- Se não existir a foreign key, criar
ALTER TABLE user_investments 
ADD CONSTRAINT user_investments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id 
ON user_investments(user_id);

-- Verificar se a constraint foi criada
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_investments'
AND tc.constraint_name = 'user_investments_user_id_fkey';