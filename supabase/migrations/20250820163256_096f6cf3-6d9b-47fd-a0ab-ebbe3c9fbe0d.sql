-- DIAGNÓSTICO E CORREÇÃO DEFINITIVA DO ERRO DE CADASTRO
-- Problema: Triggers não estão sendo criados na tabela auth.users (restrição do Supabase)
-- Solução: Usar webhooks e RPC functions para criar perfis

-- 1. Primeiro, vamos tentar verificar se podemos criar triggers em auth.users
DO $$
BEGIN
    -- Tentar criar trigger simples para teste
    BEGIN
        CREATE OR REPLACE FUNCTION public.test_auth_trigger()
        RETURNS TRIGGER AS $func$
        BEGIN
            RAISE NOTICE 'Trigger de teste executado para: %', NEW.email;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Tentar criar trigger na tabela auth.users
        DROP TRIGGER IF EXISTS test_trigger ON auth.users;
        CREATE TRIGGER test_trigger
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION test_auth_trigger();
            
        RAISE NOTICE 'Trigger criado com sucesso na tabela auth.users';
        
        -- Remover trigger de teste
        DROP TRIGGER test_trigger ON auth.users;
        DROP FUNCTION test_auth_trigger();
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERRO: Não é possível criar triggers em auth.users: %', SQLERRM;
    END;
END $$;

-- 2. Como alternativa, vamos criar uma função RPC para criar perfis manualmente
CREATE OR REPLACE FUNCTION public.create_user_profile_manual(
    user_id_param UUID,
    email_param TEXT,
    first_name_param TEXT DEFAULT NULL,
    last_name_param TEXT DEFAULT NULL,
    username_param TEXT DEFAULT NULL,
    cpf_param TEXT DEFAULT NULL,
    whatsapp_param TEXT DEFAULT NULL,
    referral_code_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    generated_username TEXT;
    generated_referral_code TEXT;
    referrer_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = user_id_param) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Perfil já existe para este usuário'
        );
    END IF;
    
    -- Gerar username único
    generated_username := COALESCE(
        username_param,
        split_part(email_param, '@', 1)
    );
    
    -- Garantir que username seja único
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
        generated_username := generated_username || '_' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Gerar código de indicação único
    generated_referral_code := generated_username || '_' || substr(user_id_param::text, 1, 8);
    
    -- Buscar indicador se código foi fornecido
    IF referral_code_param IS NOT NULL THEN
        SELECT user_id INTO referrer_user_id
        FROM profiles 
        WHERE referral_code = referral_code_param 
        OR username = referral_code_param;
    END IF;
    
    -- Criar perfil
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
        user_id_param,
        email_param,
        COALESCE(
            NULLIF(TRIM(first_name_param || ' ' || last_name_param), ''),
            generated_username
        ),
        generated_username,
        first_name_param,
        last_name_param,
        cpf_param,
        whatsapp_param,
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
            user_id_param,
            referral_code_param,
            5.00,
            'active',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Perfil criado com sucesso',
        'profile', json_build_object(
            'user_id', user_id_param,
            'username', generated_username,
            'referral_code', generated_referral_code,
            'referred_by', referrer_user_id
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para confirmar email manualmente
CREATE OR REPLACE FUNCTION public.confirm_email_manual(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Buscar usuário pelo email
    SELECT id, email, email_confirmed_at INTO user_record
    FROM auth.users 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Confirmar email se ainda não confirmado
    IF user_record.email_confirmed_at IS NULL THEN
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = user_record.id;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Email confirmado com sucesso'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'message', 'Email já estava confirmado'
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar se as funções foram criadas
SELECT 
    'Funções criadas' as info,
    proname as function_name
FROM pg_proc 
WHERE proname IN ('create_user_profile_manual', 'confirm_email_manual')
ORDER BY proname;