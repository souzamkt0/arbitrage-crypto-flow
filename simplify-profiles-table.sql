-- Simplificar tabela profiles - remover foto e nome obrigatórios
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Tornar campos opcionais (se não estiverem)
ALTER TABLE profiles 
ALTER COLUMN display_name DROP NOT NULL;

ALTER TABLE profiles 
ALTER COLUMN username DROP NOT NULL;

-- 3. Remover constraints de unicidade desnecessárias (se existirem)
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_display_name_key;

-- 4. Verificar se existe coluna de foto de perfil e removê-la se necessário
-- ALTER TABLE profiles DROP COLUMN IF EXISTS profile_photo_url;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS photo_url;

-- 5. Criar função para inserir perfil mínimo
CREATE OR REPLACE FUNCTION create_minimal_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil mínimo sem nome ou foto
    INSERT INTO public.profiles (
        user_id,
        email,
        role,
        balance,
        total_profit,
        referral_code,
        referred_by,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'user',
        0.00,
        0.00,
        COALESCE(NEW.raw_user_meta_data->>'referral_code', 'souzamkt0'),
        NULL,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Aplicar trigger para criar perfil mínimo automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_minimal_profile();

-- 7. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'profiles';

-- 8. Atualizar perfis existentes sem nome para ter um nome padrão
UPDATE profiles 
SET display_name = CONCAT('Usuário ', SUBSTRING(email, 1, POSITION('@' IN email) - 1))
WHERE display_name IS NULL OR display_name = '';

-- 9. Verificar estrutura final
SELECT 
    'Estrutura Final' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 10. Testar criação de perfil mínimo
-- SELECT create_minimal_profile();

-- 11. Verificar perfis existentes
SELECT 
    user_id,
    email,
    display_name,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;



