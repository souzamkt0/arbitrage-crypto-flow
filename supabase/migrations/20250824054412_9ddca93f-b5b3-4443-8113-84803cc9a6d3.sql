-- Atualizar o limite máximo de retorno diário para permitir valores maiores que 2%
UPDATE investment_plans 
SET max_daily_return = 10.0
WHERE status = 'active';