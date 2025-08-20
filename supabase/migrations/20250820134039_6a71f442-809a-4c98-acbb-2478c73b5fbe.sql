-- Corrigir erro e implementar sistema completo de cadastro com indicações
-- 1. Corrigir função de teste anterior
DROP FUNCTION IF EXISTS test_referral_signup(TEXT, TEXT);

CREATE OR REPLACE FUNCTION test_referral_signup(
    test_email TEXT,
    ref_code TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    referrer_id UUID;
    result JSON;
BEGIN
    -- Simular ID de usuário
    new_user_id := gen_random_uuid();
    
    -- Buscar quem indicou (se houver código)
    IF ref_code IS NOT NULL THEN
        SELECT user_id INTO referrer_id
        FROM profiles 
        WHERE referral_code = ref_code 
        OR username = ref_code;
    END IF;
    
    -- Simular criação de perfil
    INSERT INTO profiles (
        user_id,
        email,
        display_name,
        username,
        referral_code,
        referred_by,
        role,
        status
    ) VALUES (
        new_user_id,
        test_email,
        'Usuário Teste',
        'teste_' || extract(epoch from now())::text,
        'ref_' || substr(new_user_id::text, 1, 8),
        referrer_id,
        'user',
        'active'
    );
    
    -- Criar entrada na tabela referrals se houver indicador
    IF referrer_id IS NOT NULL THEN
        INSERT INTO referrals (
            referrer_id,
            referred_id,
            referral_code,
            commission_rate,
            status
        ) VALUES (
            referrer_id,
            new_user_id,
            ref_code,
            5.00,
            'active'
        );
    END IF;
    
    -- Retornar resultado
    result := json_build_object(
        'success', true,
        'new_user_id', new_user_id,
        'referrer_found', referrer_id IS NOT NULL,
        'referrer_id', referrer_id,
        'referral_code_used', ref_code
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para automatizar criação de perfil
CREATE OR REPLACE FUNCTION create_user_profile_with_referral()
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
    
    -- Criar perfil do usuário
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
        'Novo usuário',
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

-- 3. Aplicar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_with_referral();

-- 4. Garantir que emails sejam confirmados automaticamente
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmar email automaticamente
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_email();

-- 5. Testar o sistema
SELECT test_referral_signup('novo@teste.com', 'admin_master') as teste_com_indicacao;
SELECT test_referral_signup('solo@teste.com') as teste_sem_indicacao;