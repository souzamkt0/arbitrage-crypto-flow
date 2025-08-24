-- Atualizar nomes dos planos para mostrar as versões corretas
UPDATE investment_plans 
SET name = 'Robô 4.0.0',
    minimum_indicators = 0
WHERE robot_version = '4.0.0';

UPDATE investment_plans 
SET name = 'Robô 4.0.5',
    minimum_indicators = 10
WHERE robot_version = '4.0.5';

UPDATE investment_plans 
SET name = 'Robô 4.1.0',
    minimum_indicators = 40
WHERE robot_version = '4.1.0';

-- Remover plano de teste
UPDATE investment_plans 
SET status = 'inactive'
WHERE robot_version = 'test-2.0';