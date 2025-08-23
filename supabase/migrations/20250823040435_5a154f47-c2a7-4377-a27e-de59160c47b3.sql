-- Criar função que calcula e armazena lucro diário
CREATE OR REPLACE FUNCTION public.calculate_and_store_daily_profit(target_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_balance NUMERIC := 0;
    daily_rate NUMERIC := 2.5; -- Taxa padrão de 2.5%
    today_profit NUMERIC := 0;
    existing_record RECORD;
BEGIN
    -- Buscar saldo atual do usuário
    SELECT balance INTO user_balance
    FROM profiles 
    WHERE user_id = target_user_id;
    
    IF user_balance IS NULL THEN
        user_balance := 0;
    END IF;
    
    -- Calcular lucro diário (2.5% do saldo)
    today_profit := user_balance * (daily_rate / 100);
    
    -- Verificar se já existe registro para hoje
    SELECT * INTO existing_record
    FROM daily_profits 
    WHERE user_id = target_user_id 
    AND date = CURRENT_DATE;
    
    IF existing_record.id IS NOT NULL THEN
        -- Atualizar registro existente
        UPDATE daily_profits 
        SET 
            today_profit = today_profit,
            total_invested = user_balance,
            last_updated = NOW()
        WHERE user_id = target_user_id 
        AND date = CURRENT_DATE;
    ELSE
        -- Inserir novo registro
        INSERT INTO daily_profits (
            user_id,
            date,
            today_profit,
            total_invested,
            daily_target,
            profit_percentage
        ) VALUES (
            target_user_id,
            CURRENT_DATE,
            today_profit,
            user_balance,
            today_profit,
            daily_rate
        );
    END IF;
    
    -- Retornar o lucro calculado
    RETURN today_profit;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar valor simulado
        RETURN user_balance * 0.025;
END;
$$;