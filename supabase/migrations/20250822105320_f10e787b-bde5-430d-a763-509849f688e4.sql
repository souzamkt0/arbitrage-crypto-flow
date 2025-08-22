-- MIGRAÇÃO COMPLETA PARA CORRIGIR TODAS AS TABELAS E ESTRUTURAS
-- ============================================================

-- 1. CORRIGIR ESTRUTURA DA TABELA PROFILES
-- ============================================================

-- Primeiro, vamos garantir que não há duplicatas na tabela profiles
DELETE FROM profiles a USING profiles b 
WHERE a.id > b.id AND a.user_id = b.user_id;

-- Alterar a estrutura da tabela profiles para usar user_id como PK
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

-- Garantir que user_id não seja nulo
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;

-- Adicionar foreign key para auth.users
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. ADICIONAR FOREIGN KEYS FALTANTES
-- ============================================================

-- Foreign key entre digitopay_transactions e profiles
ALTER TABLE digitopay_transactions 
ADD CONSTRAINT digitopay_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre deposits e profiles
ALTER TABLE deposits 
ADD CONSTRAINT deposits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre withdrawals e profiles
ALTER TABLE withdrawals 
ADD CONSTRAINT withdrawals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre user_investments e profiles
ALTER TABLE user_investments 
ADD CONSTRAINT user_investments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre user_investments e investment_plans
ALTER TABLE user_investments 
ADD CONSTRAINT user_investments_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE;

-- Foreign key entre referrals e profiles
ALTER TABLE referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE referrals 
ADD CONSTRAINT referrals_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre trading_history e profiles
ALTER TABLE trading_history 
ADD CONSTRAINT trading_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Foreign key entre partners e profiles
ALTER TABLE partners 
ADD CONSTRAINT partners_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Índices para digitopay_transactions
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_user_id ON digitopay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_status ON digitopay_transactions(status);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_type ON digitopay_transactions(type);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_created_at ON digitopay_transactions(created_at DESC);

-- Índices para deposits
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);

-- Índices para withdrawals
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Índices para user_investments
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status);
CREATE INDEX IF NOT EXISTS idx_user_investments_plan_id ON user_investments(plan_id);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- 4. CORRIGIR ENUM APP_ROLE PARA INCLUIR PARTNER
-- ============================================================

-- Adicionar 'partner' ao enum se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partner' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
        ALTER TYPE app_role ADD VALUE 'partner';
    END IF;
END $$;

-- 5. CRIAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================================

-- Função para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
    
    -- Gerar username base
    base_username := split_part(NEW.email, '@', 1);
    new_username := base_username;
    
    -- Garantir username único
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
        username_counter := username_counter + 1;
        new_username := base_username || username_counter::text;
    END LOOP;
    
    -- Buscar referrer se código foi fornecido
    IF ref_code IS NOT NULL THEN
        SELECT user_id INTO referrer_user_id
        FROM profiles 
        WHERE referral_code = ref_code OR username = ref_code;
    END IF;
    
    -- Inserir perfil
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
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        new_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', new_username),
        'ref_' || substr(NEW.id::text, 1, 8),
        referrer_user_id::text,
        'user',
        'active',
        false,
        true
    );
    
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
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro mas não falha o registro
        RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER PARA NOVOS USUÁRIOS
-- ============================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. VERIFICAR E CORRIGIR DADOS EXISTENTES
-- ============================================================

-- Garantir que todos os perfis tenham referral_code
UPDATE profiles 
SET referral_code = 'ref_' || substr(user_id::text, 1, 8)
WHERE referral_code IS NULL OR referral_code = '';

-- Garantir que todos os perfis tenham username
UPDATE profiles 
SET username = 'user_' || substr(user_id::text, 1, 8)
WHERE username IS NULL OR username = '';

-- 8. VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar integridade das foreign keys
SELECT 
    'digitopay_transactions' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN user_id NOT IN (SELECT user_id FROM profiles) THEN 1 END) as sem_profile
FROM digitopay_transactions
UNION ALL
SELECT 
    'deposits' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN user_id NOT IN (SELECT user_id FROM profiles) THEN 1 END) as sem_profile
FROM deposits
UNION ALL
SELECT 
    'withdrawals' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN user_id NOT IN (SELECT user_id FROM profiles) THEN 1 END) as sem_profile
FROM withdrawals;