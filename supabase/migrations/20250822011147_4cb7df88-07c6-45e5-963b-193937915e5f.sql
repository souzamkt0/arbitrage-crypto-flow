-- Corrigir e melhorar a função process_investment
DROP FUNCTION IF EXISTS public.process_investment(UUID, TEXT, NUMERIC);

CREATE OR REPLACE FUNCTION public.process_investment(
    p_user_id UUID,
    p_plan_id TEXT,
    p_amount NUMERIC
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_profile RECORD;
    v_referral_count INTEGER := 0;
    v_investment_id UUID;
    v_end_date TIMESTAMP WITH TIME ZONE;
    v_plan_name TEXT;
    v_daily_rate NUMERIC;
    v_min_amount NUMERIC;
    v_max_amount NUMERIC;
    v_duration_days INTEGER;
    v_required_referrals INTEGER;
    result JSON;
BEGIN
    -- Log de início
    RAISE NOTICE 'Iniciando processamento do investimento: user_id=%, plan_id=%, amount=%', p_user_id, p_plan_id, p_amount;
    
    -- Buscar dados do usuário
    SELECT * INTO v_user_profile
    FROM profiles 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Definir dados dos planos baseados no ID
    CASE p_plan_id
        WHEN 'robo-400' THEN
            v_plan_name := 'Robô 4.0.0';
            v_daily_rate := 2.0;
            v_min_amount := 10;
            v_max_amount := 10000;
            v_duration_days := 30;
            v_required_referrals := 0;
        WHEN 'robo-405' THEN
            v_plan_name := 'Robô 4.0.5';
            v_daily_rate := 3.0;
            v_min_amount := 10;
            v_max_amount := 25000;
            v_duration_days := 30;
            v_required_referrals := 10;
        WHEN 'robo-410' THEN
            v_plan_name := 'Robô 4.1.0';
            v_daily_rate := 4.0;
            v_min_amount := 10;
            v_max_amount := 50000;
            v_duration_days := 30;
            v_required_referrals := 40;
        WHEN 'seja-socio' THEN
            v_plan_name := 'Seja Sócio';
            v_daily_rate := 2.0;
            v_min_amount := 10;
            v_max_amount := 2000000;
            v_duration_days := 365;
            v_required_referrals := 0;
        ELSE
            RETURN json_build_object(
                'success', false,
                'error', 'Plano não encontrado: ' || p_plan_id
            );
    END CASE;
    
    -- Verificar valor mínimo e máximo
    IF p_amount < v_min_amount OR p_amount > v_max_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', format('Valor deve estar entre $%s e $%s', v_min_amount, v_max_amount)
        );
    END IF;
    
    -- Verificar indicações necessárias
    IF v_required_referrals > 0 THEN
        SELECT COUNT(*) INTO v_referral_count
        FROM referrals 
        WHERE referrer_id = p_user_id 
        AND status = 'active';
        
        IF v_referral_count < v_required_referrals THEN
            RETURN json_build_object(
                'success', false,
                'error', format('Você precisa de %s indicações ativas para este plano. Você tem %s.', v_required_referrals, v_referral_count)
            );
        END IF;
    END IF;
    
    -- Calcular data final
    v_end_date := NOW() + (v_duration_days || ' days')::INTERVAL;
    
    -- Criar investimento
    INSERT INTO user_investments (
        user_id,
        plan_id,
        amount,
        daily_rate,
        end_date,
        total_operations,
        status,
        start_date
    ) VALUES (
        p_user_id,
        p_plan_id,
        p_amount,
        v_daily_rate,
        v_end_date,
        v_duration_days,
        'active',
        NOW()
    ) RETURNING id INTO v_investment_id;
    
    -- Registrar comissão de indicação se houver
    IF v_user_profile.referred_by IS NOT NULL THEN
        BEGIN
            PERFORM calculate_referral_commission(p_user_id, p_amount);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao calcular comissão de indicação: %', SQLERRM;
        END;
    END IF;
    
    -- Log de sucesso
    RAISE NOTICE 'Investimento criado com sucesso: investment_id=%', v_investment_id;
    
    RETURN json_build_object(
        'success', true,
        'investment_id', v_investment_id,
        'plan_name', v_plan_name,
        'amount', p_amount,
        'daily_rate', v_daily_rate,
        'duration_days', v_duration_days,
        'end_date', v_end_date,
        'message', format('Investimento de $%s no %s criado com sucesso!', p_amount, v_plan_name)
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no processamento do investimento: %', SQLERRM;
        RETURN json_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$;

-- Garantir que a função pode ser executada
GRANT EXECUTE ON FUNCTION public.process_investment(UUID, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_investment(UUID, TEXT, NUMERIC) TO service_role;