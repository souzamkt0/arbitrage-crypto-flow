-- SOLUÇÃO DRÁSTICA: Recriar tabela profiles do zero
-- 1. Backup dados existentes
CREATE TEMP TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. Dropar tabela problemática
DROP TABLE profiles CASCADE;

-- 3. Recriar tabela profiles limpa
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    cpf TEXT,
    phone TEXT,
    avatar_url TEXT,
    display_name TEXT,
    username TEXT,
    role TEXT DEFAULT 'user',
    balance NUMERIC(15,2) DEFAULT 0.00,
    total_profit NUMERIC(15,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    bio TEXT,
    avatar TEXT DEFAULT 'avatar1',
    referral_code TEXT,
    referred_by TEXT,
    profile_completed BOOLEAN DEFAULT false,
    whatsapp TEXT,
    email_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Recriar políticas básicas
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Adicionar constraint para role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'partner'));

SELECT 'TABELA PROFILES RECRIADA' as resultado, '✅ PRONTO PARA CRIAR USUÁRIOS' as status;