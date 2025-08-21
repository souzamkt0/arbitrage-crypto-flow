-- Limpar planos existentes para evitar duplicatas
DELETE FROM investment_plans;

-- Criar os 3 planos padronizados de arbitragem
INSERT INTO investment_plans (
    name,
    robot_version,
    daily_rate,
    minimum_amount,
    max_investment_amount,
    duration_days,
    minimum_indicators,
    description,
    features,
    status
) VALUES 

-- PLANO 1: Robô 4.0.0 - Iniciante
(
    'Robô 4.0.0',
    '4.0.0',
    2.5,
    10.00,
    100.00,
    40,
    0,
    'Plano iniciante sem requisitos de indicação. Ideal para começar na arbitragem de criptomoedas com baixo risco.',
    '["✅ Sem indicações necessárias", "💰 Taxa diária: 2.5%", "⏰ Duração: 40 dias", "🔄 2-3 operações por dia", "📊 Rentabilidade: ~100% em 40 dias"]'::jsonb,
    'active'
),

-- PLANO 2: Robô 4.0.5 - Intermediário  
(
    'Robô 4.0.5',
    '4.0.5',
    3.0,
    100.00,
    500.00,
    40,
    10,
    'Plano intermediário para investidores experientes. Requer 10 indicações ativas para maior segurança.',
    '["👥 Mínimo 10 indicações", "💰 Taxa diária: 3.0%", "⏰ Duração: 40 dias", "🔄 3-4 operações por dia", "📊 Rentabilidade: ~120% em 40 dias"]'::jsonb,
    'active'
),

-- PLANO 3: Robô 4.1.0 - Avançado
(
    'Robô 4.1.0',
    '4.1.0',
    4.0,
    500.00,
    5000.00,
    40,
    20,
    'Plano avançado para investidores profissionais. Máxima rentabilidade com 20 indicações ativas.',
    '["👥 Mínimo 20 indicações", "💰 Taxa diária: 4.0%", "⏰ Duração: 40 dias", "🔄 4-5 operações por dia", "📊 Rentabilidade: ~160% em 40 dias", "🏆 Plano Premium"]'::jsonb,
    'active'
);

-- Função para sincronizar planos (pode ser usada pelo admin)
CREATE OR REPLACE FUNCTION sync_arbitrage_plans()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    plan_count integer;
BEGIN
    -- Verificar se o usuário é admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas admins podem sincronizar planos'
        );
    END IF;

    -- Contar planos ativos
    SELECT COUNT(*) INTO plan_count
    FROM investment_plans 
    WHERE status = 'active';

    -- Retornar status
    RETURN json_build_object(
        'success', true,
        'message', 'Planos sincronizados com sucesso',
        'total_plans', plan_count,
        'synchronized_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;