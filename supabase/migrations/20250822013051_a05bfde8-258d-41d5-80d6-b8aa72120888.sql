-- Criar plano de teste com 2% de taxa diária
INSERT INTO investment_plans (
    name,
    robot_version,
    description,
    minimum_amount,
    max_investment_amount,
    daily_rate,
    duration_days,
    minimum_indicators,
    features,
    status
) VALUES (
    'Plano Teste 2%',
    'test-2.0',
    'Plano especial para testes com taxa diária de 2%',
    1.00,
    1000.00,
    2.0,
    30,
    0,
    '["Taxa diária de 2%", "Sem indicações necessárias", "Plano para testes", "Valor mínimo R$ 1"]'::jsonb,
    'active'
);