-- Remover o plano duplicado do Robô 4.0.0
DELETE FROM investment_plans 
WHERE name = 'Robô 4.0.0' 
AND id = '90012079-d7bd-4fa5-aa64-933a92fdee92';

-- Verificar se ficou apenas um
SELECT id, name, daily_rate, max_daily_return 
FROM investment_plans 
WHERE name = 'Robô 4.0.0';