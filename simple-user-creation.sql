-- Criação simplificada de usuário (sem RLS)
-- Execute este código no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Criar função muito simples
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico sem verificações complexas
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'Usuário',
        'user',
        'Novo usuário',
        'avatar1',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger simples
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 5. Verificar se foi criado
SELECT 
    'Trigger criado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 6. Testar inserção manual
INSERT INTO profiles (
    user_id,
    email,
    display_name,
    username,
    bio,
    avatar,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste2@exemplo.com',
    'Teste 2',
    'teste2',
    'Teste manual',
    'avatar1',
    NOW(),
    NOW()
);

-- 7. Verificar se funcionou
SELECT 
    'Teste manual' as info,
    COUNT(*) as total
FROM profiles 
WHERE email = 'teste2@exemplo.com';

-- 8. Limpar teste
DELETE FROM profiles WHERE email = 'teste2@exemplo.com';

-- 9. Verificar estrutura final
SELECT 
    'Estrutura final' as info,
    'RLS desabilitado' as rls_status,
    'Trigger simples criado' as trigger_status,
    'Função básica' as function_status;

-- 10. Reabilitar RLS (opcional - comentado)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
