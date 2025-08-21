-- Script completo para recriar a tabela profiles e resolver problemas de cadastro
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover tabela profiles existente (se houver)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Remover função de atualização se existir
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar tabela profiles com estrutura correta
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    cpf TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Criar trigger para updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar trigger para criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 10. Configurar confirmação de email (execute no painel do Supabase)
-- Vá em Authentication > Settings e configure:
-- - Enable email confirmations: ON
-- - Secure email change: ON
-- - Double confirm email changes: ON

-- 11. Criar perfis para usuários existentes (se houver)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 12. Verificações finais
SELECT 'Tabela profiles criada com sucesso!' as status;
SELECT COUNT(*) as total_usuarios FROM auth.users;
SELECT COUNT(*) as total_perfis FROM public.profiles;
SELECT * FROM public.profiles LIMIT 5;

-- Instruções:
-- 1. Copie todo este script
-- 2. Vá para o Supabase Dashboard > SQL Editor
-- 3. Cole o script e execute
-- 4. Verifique se não há erros
-- 5. Teste o cadastro novamente