-- Corrigir a função process_investment para usar IDs reais dos planos
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
    v_plan_uuid UUID;
    v_plan RECORD;
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
    
    -- Buscar plano real baseado no robot_version ou name
    CASE p_plan_id
        WHEN 'robo-400' THEN
            SELECT * INTO v_plan FROM investment_plans WHERE robot_version = '4.0.0' OR name = 'Robô 4.0.0' LIMIT 1;
        WHEN 'robo-405' THEN  
            SELECT * INTO v_plan FROM investment_plans WHERE robot_version = '4.0.5' OR name = 'Robô 4.0.5' LIMIT 1;
        WHEN 'robo-410' THEN
            SELECT * INTO v_plan FROM investment_plans WHERE robot_version = '4.1.0' OR name = 'Robô 4.1.0' LIMIT 1;
        WHEN 'seja-socio' THEN
            -- Para "Seja Sócio", vamos usar o primeiro plano disponível como referência
            SELECT * INTO v_plan FROM investment_plans WHERE name = 'Robô 4.0.0' LIMIT 1;
        ELSE
            RETURN json_build_object(
                'success', false,
                'error', 'Plano não encontrado: ' || p_plan_id
            );
    END CASE;
    
    -- Verificar se o plano foi encontrado
    IF v_plan.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Plano não encontrado no sistema: ' || p_plan_id
        );
    END IF;
    
    -- Ajustar configurações específicas para "Seja Sócio"
    IF p_plan_id = 'seja-socio' THEN
        v_plan.name := 'Seja Sócio';
        v_plan.daily_rate := 2.0;
        v_plan.minimum_amount := 10;
        v_plan.max_investment_amount := 2000000;
        v_plan.duration_days := 365;
        v_plan.minimum_indicators := 0;
    END IF;
    
    -- Verificar valor mínimo e máximo
    IF p_amount < v_plan.minimum_amount OR p_amount > COALESCE(v_plan.max_investment_amount, 999999999) THEN
        RETURN json_build_object(
            'success', false,
            'error', format('Valor deve estar entre $%s e $%s', v_plan.minimum_amount, COALESCE(v_plan.max_investment_amount, 999999999))
        );
    END IF;
    
    -- Verificar indicações necessárias para planos específicos
    IF (p_plan_id = 'robo-405' AND v_plan.minimum_indicators < 10) THEN
        v_plan.minimum_indicators := 10;
    ELSIF (p_plan_id = 'robo-410' AND v_plan.minimum_indicators < 40) THEN
        v_plan.minimum_indicators := 40;
    END IF;
    
    IF v_plan.minimum_indicators > 0 THEN
        SELECT COUNT(*) INTO v_referral_count
        FROM referrals 
        WHERE referrer_id = p_user_id 
        AND status = 'active';
        
        IF v_referral_count < v_plan.minimum_indicators THEN
            RETURN json_build_object(
                'success', false,
                'error', format('Você precisa de %s indicações ativas para este plano. Você tem %s.', v_plan.minimum_indicators, v_referral_count)
            );
        END IF;
    END IF;
    
    -- Calcular data final
    v_end_date := NOW() + (v_plan.duration_days || ' days')::INTERVAL;
    
    -- Criar investimento usando UUID real do plano
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
        v_plan.id,
        p_amount,
        v_plan.daily_rate,
        v_end_date,
        v_plan.duration_days,
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
        'plan_name', v_plan.name,
        'amount', p_amount,
        'daily_rate', v_plan.daily_rate,
        'duration_days', v_plan.duration_days,
        'end_date', v_end_date,
        'message', format('Investimento de $%s no %s criado com sucesso!', p_amount, v_plan.name)
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