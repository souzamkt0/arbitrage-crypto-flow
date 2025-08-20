-- Remover triggers e funções com CASCADE para resolver dependências
DROP TRIGGER IF EXISTS auto_confirm_emails_trigger ON auth.users CASCADE;
DROP FUNCTION IF EXISTS auto_confirm_new_emails() CASCADE;
DROP TRIGGER IF EXISTS confirm_email_trigger ON auth.users CASCADE;
DROP FUNCTION IF EXISTS auto_confirm_email() CASCADE;

-- Agora criar uma função limpa para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir o perfil básico quando um novo usuário se cadastrar
    INSERT INTO public.profiles (
        user_id,
        email,
        username,
        display_name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        split_part(NEW.email, '@', 1),
        split_part(NEW.email, '@', 1),
        'user',
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der erro, não falhar o cadastro
        RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_signup();