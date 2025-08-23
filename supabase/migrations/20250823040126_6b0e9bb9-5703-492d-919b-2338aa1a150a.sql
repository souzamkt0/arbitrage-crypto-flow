-- Fix the calculate_and_store_daily_profit function to properly store data
CREATE OR REPLACE FUNCTION calculate_and_store_daily_profit(target_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_investments_record RECORD;
    daily_profit NUMERIC := 0;
    current_date_only DATE := CURRENT_DATE;
BEGIN
    -- Calculate daily profit based on active investments
    FOR user_investments_record IN 
        SELECT amount, daily_rate
        FROM user_investments 
        WHERE user_id = target_user_id 
        AND status = 'active'
    LOOP
        daily_profit := daily_profit + (user_investments_record.amount * user_investments_record.daily_rate / 100);
    END LOOP;
    
    -- Add some realistic variation (±10%)
    daily_profit := daily_profit * (0.9 + (RANDOM() * 0.2));
    
    -- Store in daily_profits table (upsert)
    INSERT INTO daily_profits (
        user_id,
        date,
        today_profit,
        total_invested,
        daily_target,
        profit_percentage
    ) 
    SELECT 
        target_user_id,
        current_date_only,
        daily_profit,
        COALESCE(SUM(amount), 0),
        daily_profit,
        2.5
    FROM user_investments 
    WHERE user_id = target_user_id 
    AND status = 'active'
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
        today_profit = daily_profit,
        last_updated = NOW();
    
    RETURN daily_profit;
END;
$$;