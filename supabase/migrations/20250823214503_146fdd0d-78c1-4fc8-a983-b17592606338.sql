-- Corrigir relacionamentos entre tabelas para queries complexas
-- Adicionar foreign keys para melhorar joins

-- 1. Adicionar foreign key entre referrals e profiles (referred_id)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'referrals_referred_id_profiles_fkey' 
    AND table_name = 'referrals'
  ) THEN
    ALTER TABLE referrals 
    ADD CONSTRAINT referrals_referred_id_profiles_fkey 
    FOREIGN KEY (referred_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Adicionar foreign key entre referrals e profiles (referrer_id)  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'referrals_referrer_id_profiles_fkey' 
    AND table_name = 'referrals'
  ) THEN
    ALTER TABLE referrals 
    ADD CONSTRAINT referrals_referrer_id_profiles_fkey 
    FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Verificar relacionamentos criados
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'referrals';