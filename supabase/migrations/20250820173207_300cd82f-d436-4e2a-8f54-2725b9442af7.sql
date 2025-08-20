-- Criar função para auto-confirmar emails
CREATE OR REPLACE FUNCTION auto_confirm_new_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Auto-confirmar email imediatamente
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$;

-- Criar trigger para auto-confirmar emails
DROP TRIGGER IF EXISTS auto_confirm_emails_trigger ON auth.users;
CREATE TRIGGER auto_confirm_emails_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_new_emails();

-- Atualizar função de criação de perfil para ser mais robusta
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    generated_username TEXT;
    generated_referral_code TEXT;
BEGIN
    -- Gerar username único
    generated_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    -- Garantir que username seja único
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
        generated_username := generated_username || '_' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Gerar código de indicação único
    generated_referral_code := generated_username || '_' || substr(NEW.id::text, 1, 8);
    
    -- Inserir perfil básico
    INSERT INTO public.profiles (
        user_id,
        email,
        username,
        display_name,
        first_name,
        last_name,
        cpf,
        whatsapp,
        bio,
        avatar,
        referral_code,
        role,
        balance,
        total_profit,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        generated_username,
        COALESCE(
            (NEW.raw_user_meta_data->>'firstName') || ' ' || (NEW.raw_user_meta_data->>'lastName'),
            generated_username
        ),
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        NEW.raw_user_meta_data->>'cpf',
        NEW.raw_user_meta_data->>'whatsapp',
        'Novo usuário da plataforma',
        'avatar1',
        generated_referral_code,
        'user',
        0.00,
        0.00,
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