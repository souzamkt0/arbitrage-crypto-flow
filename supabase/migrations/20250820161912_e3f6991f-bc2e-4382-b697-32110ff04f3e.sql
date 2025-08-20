-- CORREÇÃO DO ERRO DE CADASTRO
-- O problema identificado: Política RLS impede inserção de perfil durante signup
-- pois auth.uid() ainda é NULL durante o processo de criação

-- 1. Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    ref_code TEXT;
    referrer_user_id UUID;
    generated_username TEXT;
    generated_referral_code TEXT;
BEGIN
    -- Log do trigger
    RAISE NOTICE 'Trigger executado para usuário: %', NEW.email;
    
    -- Extrair código de indicação dos metadados
    ref_code := COALESCE(
        NEW.raw_user_meta_data->>'referral_code',
        NEW.raw_user_meta_data->>'referralCode'
    );
    
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
    
    -- Buscar indicador se código foi fornecido
    IF ref_code IS NOT NULL THEN
        SELECT user_id INTO referrer_user_id
        FROM profiles 
        WHERE referral_code = ref_code 
        OR username = ref_code;
        
        RAISE NOTICE 'Código de indicação: %, Indicador encontrado: %', ref_code, referrer_user_id;
    END IF;
    
    -- Criar perfil do usuário usando SECURITY DEFINER para bypass RLS
    INSERT INTO profiles (
        user_id,
        email,
        display_name,
        username,
        first_name,
        last_name,
        cpf,
        whatsapp,
        bio,
        avatar,
        referral_code,
        referred_by,
        role,
        balance,
        total_profit,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            (NEW.raw_user_meta_data->>'first_name') || ' ' || (NEW.raw_user_meta_data->>'last_name'),
            generated_username
        ),
        generated_username,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'cpf',
        NEW.raw_user_meta_data->>'whatsapp',
        'Novo usuário da plataforma',
        'avatar1',
        generated_referral_code,
        referrer_user_id,
        'user',
        0.00,
        0.00,
        'active',
        NOW(),
        NOW()
    );
    
    -- Criar entrada de indicação se houver indicador
    IF referrer_user_id IS NOT NULL THEN
        INSERT INTO referrals (
            referrer_id,
            referred_id,
            referral_code,
            commission_rate,
            status,
            created_at,
            updated_at
        ) VALUES (
            referrer_user_id,
            NEW.id,
            ref_code,
            5.00,
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Referência criada: % -> %', referrer_user_id, NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no trigger: %', SQLERRM;
        -- Não falhar o cadastro por causa do perfil
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para execução automática
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 3. Confirmar todos os emails automaticamente (para facilitar testes)
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_confirm_email_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_email();

-- 4. Verificar se trigger foi criado
SELECT 
    'Trigger criado com sucesso' as status,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';