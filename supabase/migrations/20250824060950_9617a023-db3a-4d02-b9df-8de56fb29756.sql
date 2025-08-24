-- Teste de atualização direta dos valores das taxas
UPDATE investment_plans 
SET daily_rate = 0.015
WHERE name = 'Robô 4.0.0' AND id = '22277d50-3f3e-4076-92d4-117afa749c8e';

-- Verificar se a atualização funcionou
SELECT id, name, daily_rate, max_daily_return 
FROM investment_plans 
WHERE name = 'Robô 4.0.0';