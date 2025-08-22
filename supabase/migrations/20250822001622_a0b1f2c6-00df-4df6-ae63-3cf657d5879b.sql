-- Verificar se existem foreign keys e criar se necessário
DO $$
BEGIN
    -- Criar foreign key para user_investments -> profiles se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_investments_user_id_fkey' 
        AND table_name = 'user_investments'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE user_investments 
        ADD CONSTRAINT user_investments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id);
    END IF;

    -- Criar foreign key para admin_balance_transactions -> profiles (user_id) se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_balance_transactions_user_id_fkey' 
        AND table_name = 'admin_balance_transactions'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE admin_balance_transactions 
        ADD CONSTRAINT admin_balance_transactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id);
    END IF;

    -- Criar foreign key para admin_balance_transactions -> profiles (admin_user_id) se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_balance_transactions_admin_user_id_fkey' 
        AND table_name = 'admin_balance_transactions'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE admin_balance_transactions 
        ADD CONSTRAINT admin_balance_transactions_admin_user_id_fkey 
        FOREIGN KEY (admin_user_id) REFERENCES profiles(user_id);
    END IF;
END $$;