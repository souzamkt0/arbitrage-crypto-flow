-- Corrigir sistema de código de indicação
-- Execute este código no SQL Editor do Supabase

-- 1. Adicionar coluna referral_code se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN referral_code TEXT DEFAULT 'souzamkt0';
        
        RAISE NOTICE 'Coluna referral_code adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna referral_code já existe';
    END IF;
END $$;

-- 2. Adicionar coluna referred_by se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'referred_by'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN referred_by UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'Coluna referred_by adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna referred_by já existe';
    END IF;
END $$;

-- 3. Atualizar usuários existentes sem referral_code
UPDATE public.profiles 
SET referral_code = 'souzamkt0' 
WHERE referral_code IS NULL;

-- 4. Criar função para criar perfil com código de indicação
CREATE OR REPLACE FUNCTION create_user_profile_with_referral()
RETURNS TRIGGER AS $$
DECLARE
    ref_code TEXT;
    referrer_user_id UUID;
    generated_username TEXT;
BEGIN
    -- Extrair código de referência do metadata
    ref_code := COALESCE(NEW.raw_user_meta_data->>'referral_code', 'souzamkt0');
    
    -- Gerar username único baseado no email
    generated_username := split_part(NEW.email, '@', 1);
    
    -- Verificar se o username já existe e torná-lo único se necessário
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
        generated_username := generated_username || floor(random() * 1000)::text;
    END LOOP;
    
    -- Buscar o referrer pelo username/código
    SELECT user_id INTO referrer_user_id 
    FROM public.profiles 
    WHERE username = lower(ref_code) OR referral_code = ref_code;
    
    -- Inserir perfil do usuário com código de indicação
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        username,
        bio,
        avatar,
        referral_code,
        referred_by,
        whatsapp,
        city,
        state,
        role,
        balance,
        total_profit,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        generated_username,
        'Novo usuário',
        'avatar1',
        ref_code,
        referrer_user_id,
        NEW.raw_user_meta_data->>'whatsapp',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        CASE 
            WHEN NEW.email = 'souzamkt0@gmail.com' THEN 'admin'
            ELSE 'user'
        END,
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    -- Se encontrou o referrer, criar o relacionamento na tabela referrals
    IF referrer_user_id IS NOT NULL THEN
        INSERT INTO public.referrals (
            referrer_id,
            referred_id,
            referral_code,
            commission_rate,
            status
        ) VALUES (
            referrer_user_id,
            NEW.id,
            ref_code,
            10.00,
            'active'
        );
        
        RAISE NOTICE 'Relacionamento de indicação criado: % -> %', ref_code, NEW.email;
    ELSE
        RAISE NOTICE 'Código de indicação não encontrado: %', ref_code;
    END IF;
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário % com código de indicação %', NEW.email, ref_code;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_with_referral();

-- 6. Verificar se o trigger foi criado
SELECT 
    'Trigger recriado' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 7. Verificar estrutura final da tabela profiles
SELECT 
    'Estrutura final' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('referral_code', 'referred_by', 'user_id', 'email', 'username')
ORDER BY column_name;

-- 8. Verificar dados de exemplo
SELECT 
    'Dados de exemplo' as info,
    user_id,
    email,
    username,
    referral_code,
    referred_by,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. Resumo final
SELECT 
    'SISTEMA CORRIGIDO' as info,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM profiles WHERE referral_code IS NOT NULL) as com_referral_code,
    (SELECT COUNT(*) FROM profiles WHERE referred_by IS NOT NULL) as com_referred_by,
    (SELECT COUNT(*) FROM referrals) as total_referrals,
    'Pronto para testar cadastro com código de indicação' as status;
