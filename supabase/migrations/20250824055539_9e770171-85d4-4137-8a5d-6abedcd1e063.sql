-- Corrigir configurações dos planos de investimento

-- Robô 4.0.0: Até 2% variável, sem requisitos de indicação
UPDATE investment_plans 
SET 
    daily_rate = 0.02,
    max_daily_return = 2.0,
    minimum_indicators = 0,
    description = 'Sistema Automatizado - Ganhos até 2% (variável, não garantido fixo através de arbitragem)',
    updated_at = NOW()
WHERE name = 'Robô 4.0.0';

-- Robô 4.0.5: Até 3% mas precisa de 10 pessoas ativas no primeiro plano
UPDATE investment_plans 
SET 
    daily_rate = 0.03,
    max_daily_return = 3.0,
    minimum_indicators = 10,
    description = 'Sistema Automatizado - Ganhos até 3% (requer 10 indicados ativos no Robô 4.0.0)',
    updated_at = NOW()
WHERE name = 'Robô 4.0.5';

-- Robô 4.1.0: Até 4% mas precisa de 40 pessoas ativas no plano 4.0.5
UPDATE investment_plans 
SET 
    daily_rate = 0.04,
    max_daily_return = 4.0,
    minimum_indicators = 40,
    description = 'Sistema Automatizado - Ganhos até 4% (requer 40 indicados ativos no Robô 4.0.5)',
    updated_at = NOW()
WHERE name = 'Robô 4.1.0';