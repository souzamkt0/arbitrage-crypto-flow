-- Análise completa do sistema de cadastro e indicações
-- 1. Verificar se há função ativa para criar perfil
SELECT 
    'Status das Funções' as info,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%profile%' OR routine_name LIKE '%referral%'
ORDER BY routine_name;

-- 2. Verificar triggers ativos
SELECT 
    'Triggers Ativos' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 3. Testar sistema de indicação - criar uma função que simula cadastro
CREATE OR REPLACE FUNCTION test_referral_signup(
    test_email TEXT,
    referral_code TEXT DEFAULT NULL
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
    IF referral_code IS NOT NULL THEN
        SELECT user_id INTO referrer_id
        FROM profiles 
        WHERE referral_code = test_referral_signup.referral_code 
        OR username = test_referral_signup.referral_code;
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
            referral_code,
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
        'referral_code_used', referral_code
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

-- 4. Testar o sistema com código de indicação existente
SELECT test_referral_signup('teste@indicacao.com', 'admin_master');

-- 5. Verificar se funcionou
SELECT 
    'Resultado do Teste' as info,
    p1.email as indicador_email,
    p1.referral_code as codigo_indicacao,
    p2.email as indicado_email,
    p2.referred_by as indicado_por,
    r.commission_rate as taxa_comissao,
    r.status as status_referral
FROM profiles p1
JOIN referrals r ON p1.user_id = r.referrer_id
JOIN profiles p2 ON r.referred_id = p2.user_id
WHERE p2.email = 'teste@indicacao.com';