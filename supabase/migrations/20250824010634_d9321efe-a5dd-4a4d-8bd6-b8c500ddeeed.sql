-- Investigar e corrigir o problema de criação de investimentos
-- Remover o trigger de validação que pode estar causando problemas

-- Verificar se existe o trigger de validação de referrals
DROP TRIGGER IF EXISTS validate_investment_referrals_trigger ON user_investments;

-- Verificar se existe a função de validação
DROP FUNCTION IF EXISTS validate_investment_referrals();

-- Criar uma função de validação mais simples que não bloqueia investimentos
CREATE OR REPLACE FUNCTION validate_investment_referrals()
RETURNS TRIGGER AS $$
DECLARE
    required_referrals INTEGER;
    user_referrals INTEGER;
BEGIN
    -- Buscar quantas indicações são necessárias para este plano
    SELECT ip.minimum_indicators INTO required_referrals
    FROM investment_plans ip
    WHERE ip.id = NEW.investment_plan_id;
    
    -- Se não há mínimo de indicações ou é 0, permitir
    IF required_referrals IS NULL OR required_referrals = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Contar indicações ativas do usuário
    SELECT COUNT(*) INTO user_referrals
    FROM referrals
    WHERE referrer_id = NEW.user_id
    AND status = 'active';
    
    -- Se tem indicações suficientes, permitir
    IF user_referrals >= required_referrals THEN
        RETURN NEW;
    END IF;
    
    -- Se não tem indicações suficientes, retornar erro informativo
    RAISE EXCEPTION 'Você precisa de % indicações ativas para investir neste plano. Você tem % indicações.',
        required_referrals, user_referrals;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger novamente (mas permitindo mais flexibilidade)
CREATE TRIGGER validate_investment_referrals_trigger
    BEFORE INSERT ON user_investments
    FOR EACH ROW
    EXECUTE FUNCTION validate_investment_referrals();

-- Adicionar log para debug
CREATE OR REPLACE FUNCTION log_investment_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da tentativa de criação
    INSERT INTO admin_settings (
        setting_key,
        setting_value,
        description
    ) VALUES (
        'investment_creation_log',
        jsonb_build_object(
            'user_id', NEW.user_id,
            'plan_id', NEW.investment_plan_id,
            'amount', NEW.amount,
            'timestamp', NOW()
        ),
        'Log de criação de investimento'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para log (opcional, pode ser removido após debug)
CREATE TRIGGER log_investment_creation_trigger
    AFTER INSERT ON user_investments
    FOR EACH ROW
    EXECUTE FUNCTION log_investment_creation();