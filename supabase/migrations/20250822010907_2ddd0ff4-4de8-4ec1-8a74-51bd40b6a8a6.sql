-- Criar função para processar investimentos
CREATE OR REPLACE FUNCTION public.process_investment(
    p_user_id UUID,
    p_plan_id TEXT,
    p_amount NUMERIC
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_data RECORD;
    v_user_profile RECORD;
    v_referral_count INTEGER := 0;
    v_investment_id UUID;
    v_end_date TIMESTAMP WITH TIME ZONE;
    result JSON;
BEGIN
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
    
    -- Definir dados dos planos
    CASE 
        WHEN p_plan_id = 'robo-400' THEN
            v_plan_data := ROW(
                'Robô 4.0.0',
                2.0,
                10,
                10000,
                30,
                0
            )::RECORD;
        WHEN p_plan_id = 'robo-405' THEN
            v_plan_data := ROW(
                'Robô 4.0.5',
                3.0,
                10,
                25000,
                30,
                10
            )::RECORD;
        WHEN p_plan_id = 'robo-410' THEN
            v_plan_data := ROW(
                'Robô 4.1.0',
                4.0,
                10,
                50000,
                30,
                40
            )::RECORD;
        WHEN p_plan_id = 'seja-socio' THEN
            v_plan_data := ROW(
                'Seja Sócio',
                2.0,
                10,
                2000000,
                365,
                0
            )::RECORD;
        ELSE
            RETURN json_build_object(
                'success', false,
                'error', 'Plano não encontrado'
            );
    END CASE;
    
    -- Verificar valor mínimo e máximo
    IF p_amount < (v_plan_data).f3 OR p_amount > (v_plan_data).f4 THEN
        RETURN json_build_object(
            'success', false,
            'error', format('Valor deve estar entre $%s e $%s', (v_plan_data).f3, (v_plan_data).f4)
        );
    END IF;
    
    -- Verificar indicações necessárias
    IF (v_plan_data).f6 > 0 THEN
        SELECT COUNT(*) INTO v_referral_count
        FROM referrals 
        WHERE referrer_id = p_user_id 
        AND status = 'active';
        
        IF v_referral_count < (v_plan_data).f6 THEN
            RETURN json_build_object(
                'success', false,
                'error', format('Você precisa de %s indicações ativas. Você tem %s.', (v_plan_data).f6, v_referral_count)
            );
        END IF;
    END IF;
    
    -- Calcular data final
    v_end_date := NOW() + ((v_plan_data).f5 || ' days')::INTERVAL;
    
    -- Criar investimento
    INSERT INTO user_investments (
        user_id,
        plan_id,
        amount,
        daily_rate,
        end_date,
        total_operations,
        status
    ) VALUES (
        p_user_id,
        p_plan_id,
        p_amount,
        (v_plan_data).f2,
        v_end_date,
        (v_plan_data).f5,
        'active'
    ) RETURNING id INTO v_investment_id;
    
    -- Registrar comissão de indicação se houver
    IF v_user_profile.referred_by IS NOT NULL THEN
        PERFORM calculate_referral_commission(p_user_id, p_amount);
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'investment_id', v_investment_id,
        'plan_name', (v_plan_data).f1,
        'amount', p_amount,
        'daily_rate', (v_plan_data).f2,
        'message', 'Investimento criado com sucesso!'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;