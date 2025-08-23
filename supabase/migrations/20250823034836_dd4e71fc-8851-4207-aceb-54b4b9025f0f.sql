-- Função para simular ganhos realistas em investimentos ativos
CREATE OR REPLACE FUNCTION simulate_investment_profits()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    investment_record RECORD;
    daily_expected NUMERIC;
    hours_since_start INTEGER;
    total_hours_in_period INTEGER;
    progress_percentage NUMERIC;
    expected_total_earned NUMERIC;
    new_today_earnings NUMERIC;
    new_total_earned NUMERIC;
    operations_to_complete INTEGER;
    updated_count INTEGER := 0;
BEGIN
    -- Processar cada investimento ativo
    FOR investment_record IN 
        SELECT id, user_id, amount, daily_rate, start_date, end_date, 
               total_earned, today_earnings, operations_completed, total_operations
        FROM user_investments 
        WHERE status = 'active'
    LOOP
        -- Calcular ganho diário esperado (percentual sobre o valor investido)
        daily_expected := investment_record.amount * (investment_record.daily_rate / 100);
        
        -- Calcular tempo desde o início
        hours_since_start := EXTRACT(EPOCH FROM (NOW() - investment_record.start_date)) / 3600;
        total_hours_in_period := EXTRACT(EPOCH FROM (investment_record.end_date - investment_record.start_date)) / 3600;
        
        -- Calcular progresso baseado no tempo (máximo 90% para deixar espaço para crescimento)
        progress_percentage := LEAST(0.9, hours_since_start / total_hours_in_period);
        
        -- Calcular ganho total esperado até agora
        expected_total_earned := (investment_record.amount * (investment_record.daily_rate / 100)) * 
                                (hours_since_start / 24.0) * (0.8 + RANDOM() * 0.4); -- Variação de 80% a 120%
        
        -- Ganhos de hoje (simular baseado na hora atual)
        new_today_earnings := daily_expected * (EXTRACT(HOUR FROM NOW()) / 24.0) * (0.7 + RANDOM() * 0.6);
        
        -- Usar o maior valor entre o atual e o esperado
        new_total_earned := GREATEST(investment_record.total_earned, expected_total_earned);
        
        -- Calcular operações completadas baseado no progresso
        operations_to_complete := FLOOR(investment_record.total_operations * progress_percentage);
        
        -- Atualizar o investimento
        UPDATE user_investments 
        SET 
            total_earned = new_total_earned,
            today_earnings = new_today_earnings,
            operations_completed = GREATEST(investment_record.operations_completed, operations_to_complete),
            updated_at = NOW()
        WHERE id = investment_record.id;
        
        updated_count := updated_count + 1;
        
        -- Inserir alguns registros de trading_profits para histórico
        IF investment_record.total_earned = 0 THEN
            INSERT INTO trading_profits (
                user_id,
                investment_amount,
                daily_rate,
                plan_name,
                total_profit,
                completed_operations,
                exchanges_count,
                execution_time_seconds,
                status
            ) VALUES (
                investment_record.user_id,
                investment_record.amount,
                investment_record.daily_rate,
                'Robô 4.0.0',
                new_total_earned,
                operations_to_complete,
                FLOOR(RANDOM() * 8) + 3, -- 3-10 exchanges
                FLOOR(RANDOM() * 300) + 60, -- 60-360 segundos
                'completed'
            );
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Ganhos simulados com sucesso',
        'investments_updated', updated_count,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;