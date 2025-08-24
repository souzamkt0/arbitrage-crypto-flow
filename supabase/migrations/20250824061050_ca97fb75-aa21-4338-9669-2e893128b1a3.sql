-- Primeiro, remover a configuração de trading que referencia o plano duplicado
DELETE FROM trading_configurations 
WHERE plan_id = '90012079-d7bd-4fa5-aa64-933a92fdee92';

-- Agora remover o plano duplicado
DELETE FROM investment_plans 
WHERE name = 'Robô 4.0.0' 
AND id = '90012079-d7bd-4fa5-aa64-933a92fdee92';

-- Verificar se ficou apenas um plano 4.0.0
SELECT id, name, daily_rate, max_daily_return 
FROM investment_plans 
WHERE name = 'Robô 4.0.0';