-- Corrigir schema da tabela profiles para compatibilidade completa
-- CRITICAL FIX: Adicionar colunas que faltam e migrar dados existentes

-- 1. Adicionar colunas que faltam na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS balance NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_profit NUMERIC(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'avatar1',
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;

-- 2. Migrar dados existentes: usar id como user_id (são iguais no caso atual)
UPDATE profiles 
SET 
    user_id = id,
    display_name = COALESCE(full_name, email, 'Usuário'),
    username = COALESCE(split_part(email, '@', 1), 'user'),
    bio = 'Usuário do sistema',
    referral_code = split_part(email, '@', 1) || '_' || substr(id::text, 1, 8)
WHERE user_id IS NULL;

-- 3. Configurar admin souzamkt0 com todas as permissões
UPDATE profiles 
SET 
    role = 'admin',
    display_name = 'Admin Souza',
    username = 'souzamkt0',
    bio = 'Administrador do Sistema',
    profile_completed = true,
    status = 'active'
WHERE email = 'souzamkt0@gmail.com';

-- 4. Adicionar constraint para garantir integridade
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Adicionar constraint para role
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'partner'));

-- 6. Verificar se tudo foi aplicado corretamente
SELECT 
    'Status Final do Admin' as info,
    u.email as auth_email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    p.role,
    p.display_name,
    p.username,
    p.user_id = u.id as ids_matching,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL 
        AND p.role = 'admin' 
        AND p.user_id = u.id THEN '✅ ADMIN FUNCIONANDO'
        ELSE '❌ AINDA TEM PROBLEMA'
    END as status_final
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'souzamkt0@gmail.com';