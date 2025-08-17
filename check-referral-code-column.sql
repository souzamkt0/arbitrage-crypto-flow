-- Verificar se a coluna referral_code existe na tabela profiles
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela profiles
SELECT 
    'Estrutura da tabela profiles' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar especificamente se referral_code existe
SELECT 
    'Verificação referral_code' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'referral_code'
        ) THEN '✅ Coluna referral_code existe'
        ELSE '❌ Coluna referral_code NÃO existe'
    END as status;

-- 3. Verificar se referred_by existe
SELECT 
    'Verificação referred_by' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'referred_by'
        ) THEN '✅ Coluna referred_by existe'
        ELSE '❌ Coluna referred_by NÃO existe'
    END as status;

-- 4. Verificar dados de exemplo na tabela profiles
SELECT 
    'Dados de exemplo' as info,
    user_id,
    email,
    username,
    display_name,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar se há usuários com referral_code
SELECT 
    'Usuários com referral_code' as info,
    COUNT(*) as total_com_referral_code
FROM profiles 
WHERE referral_code IS NOT NULL;

-- 6. Verificar se há usuários com referred_by
SELECT 
    'Usuários com referred_by' as info,
    COUNT(*) as total_com_referred_by
FROM profiles 
WHERE referred_by IS NOT NULL;
