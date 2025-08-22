-- MIGRAÇÃO COMPLETA CORRIGIDA PARA FIXAR TODAS AS TABELAS
-- ============================================================

-- 1. CORRIGIR ESTRUTURA DA TABELA PROFILES
-- ============================================================

-- Verificar e corrigir primary key da tabela profiles
DO $$ 
BEGIN
    -- Apenas alterar se não for user_id a PK atual
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_pkey' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
        ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);
    END IF;
END $$;

-- Garantir que user_id não seja nulo
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;

-- 2. ADICIONAR FOREIGN KEYS SOMENTE SE NÃO EXISTIREM
-- ============================================================

-- Profiles -> auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_auth_fkey'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_auth_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Digitopay_transactions -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'digitopay_transactions_profiles_fkey'
    ) THEN
        ALTER TABLE digitopay_transactions 
        ADD CONSTRAINT digitopay_transactions_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Deposits -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'deposits_profiles_fkey'
    ) THEN
        ALTER TABLE deposits 
        ADD CONSTRAINT deposits_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Withdrawals -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'withdrawals_profiles_fkey'
    ) THEN
        ALTER TABLE withdrawals 
        ADD CONSTRAINT withdrawals_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- User_investments -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_investments_profiles_fkey'
    ) THEN
        ALTER TABLE user_investments 
        ADD CONSTRAINT user_investments_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- User_investments -> investment_plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_investments_plans_fkey'
    ) THEN
        ALTER TABLE user_investments 
        ADD CONSTRAINT user_investments_plans_fkey 
        FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Referrals -> profiles (referrer)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'referrals_referrer_profiles_fkey'
    ) THEN
        ALTER TABLE referrals 
        ADD CONSTRAINT referrals_referrer_profiles_fkey 
        FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Referrals -> profiles (referred)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'referrals_referred_profiles_fkey'
    ) THEN
        ALTER TABLE referrals 
        ADD CONSTRAINT referrals_referred_profiles_fkey 
        FOREIGN KEY (referred_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Trading_history -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trading_history_profiles_fkey'
    ) THEN
        ALTER TABLE trading_history 
        ADD CONSTRAINT trading_history_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Partners -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'partners_profiles_fkey'
    ) THEN
        ALTER TABLE partners 
        ADD CONSTRAINT partners_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Índices para digitopay_transactions
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_user_id ON digitopay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_status ON digitopay_transactions(status);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_type ON digitopay_transactions(type);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_created_at ON digitopay_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_trx_id ON digitopay_transactions(trx_id);

-- Índices para deposits
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_type ON deposits(type);

-- Índices para withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Índices para user_investments
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status);
CREATE INDEX IF NOT EXISTS idx_user_investments_plan_id ON user_investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_created_at ON user_investments(created_at DESC);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Índices para referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 4. VERIFICAR E CORRIGIR DADOS EXISTENTES
-- ============================================================

-- Garantir que todos os perfis tenham referral_code
UPDATE profiles 
SET referral_code = 'ref_' || substr(user_id::text, 1, 8)
WHERE referral_code IS NULL OR referral_code = '';

-- Garantir que todos os perfis tenham username único
UPDATE profiles 
SET username = 'user_' || substr(user_id::text, 1, 8)
WHERE username IS NULL OR username = '';

-- Corrigir usernames duplicados
WITH duplicated_usernames AS (
    SELECT user_id, username, 
           ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
    FROM profiles 
    WHERE username IS NOT NULL
)
UPDATE profiles 
SET username = p.username || p.rn::text
FROM duplicated_usernames p
WHERE profiles.user_id = p.user_id AND p.rn > 1;

-- 5. FUNÇÃO TRIGGER MELHORADA PARA NOVOS USUÁRIOS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS TRIGGER AS $$
DECLARE
    ref_code TEXT;
    referrer_user_id UUID;
    new_username TEXT;
    username_counter INTEGER := 0;
    base_username TEXT;
BEGIN
    -- Extrair código de referência se existir
    ref_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Gerar username base limpo
    base_username := REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g');
    IF LENGTH(base_username) < 3 THEN
        base_username := 'user' || substr(NEW.id::text, 1, 4);
    END IF;
    
    new_username := LOWER(base_username);
    
    -- Garantir username único
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
        username_counter := username_counter + 1;
        new_username := LOWER(base_username) || username_counter::text;
    END LOOP;
    
    -- Buscar referrer se código foi fornecido
    IF ref_code IS NOT NULL AND ref_code != '' THEN
        SELECT user_id INTO referrer_user_id
        FROM profiles 
        WHERE referral_code = ref_code OR username = ref_code
        LIMIT 1;
    END IF;
    
    -- Inserir perfil com ON CONFLICT para evitar duplicatas
    INSERT INTO public.profiles (
        user_id,
        email,
        username,
        display_name,
        referral_code,
        referred_by,
        role,
        status,
        profile_completed,
        email_verified,
        balance,
        total_profit
    ) VALUES (
        NEW.id,
        NEW.email,
        new_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', new_username),
        'ref_' || substr(NEW.id::text, 1, 8),
        referrer_user_id::text,
        'user',
        'active',
        false,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        0.00,
        0.00
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Criar entrada na tabela referrals se houver referrer
    IF referrer_user_id IS NOT NULL THEN
        INSERT INTO public.referrals (
            referrer_id,
            referred_id,
            referral_code,
            commission_rate,
            status
        ) VALUES (
            referrer_user_id,
            NEW.id,
            ref_code,
            10.00,
            'active'
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro mas não falha o registro
        RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RECRIAR TRIGGER PARA NOVOS USUÁRIOS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v2();

-- 7. VERIFICAÇÃO FINAL E RELATÓRIO
-- ============================================================

-- Mostrar estrutura das tabelas principais
SELECT 
    'RELATÓRIO DE ESTRUTURA DO BANCO DE DADOS' as titulo,
    '' as separador;

-- Contar registros nas tabelas principais
SELECT 
    'profiles' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(CASE WHEN referral_code IS NOT NULL THEN 1 END) as com_referral_code,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as com_username
FROM profiles
UNION ALL
SELECT 
    'digitopay_transactions' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as com_referral_code,
    COUNT(CASE WHEN type = 'deposit' THEN 1 END) as com_username
FROM digitopay_transactions
UNION ALL
SELECT 
    'deposits' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as com_referral_code,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as com_username
FROM deposits
UNION ALL
SELECT 
    'withdrawals' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as com_referral_code,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as com_username
FROM withdrawals
UNION ALL
SELECT 
    'user_investments' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as com_referral_code,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as com_username
FROM user_investments;