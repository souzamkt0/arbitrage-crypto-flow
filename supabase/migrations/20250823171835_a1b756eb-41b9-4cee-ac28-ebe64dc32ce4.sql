-- Criar enum para tipos de saque
CREATE TYPE withdrawal_type AS ENUM ('residual', 'referral', 'profit', 'pix');

-- Adicionar nova coluna com o tipo enum
ALTER TABLE withdrawals ADD COLUMN withdrawal_type withdrawal_type DEFAULT 'pix';

-- Converter dados existentes
UPDATE withdrawals SET withdrawal_type = 
  CASE 
    WHEN type = 'pix' THEN 'pix'::withdrawal_type
    WHEN type = 'residual' THEN 'residual'::withdrawal_type
    WHEN type = 'referral' THEN 'referral'::withdrawal_type
    WHEN type = 'profit' THEN 'profit'::withdrawal_type
    ELSE 'pix'::withdrawal_type
  END;

-- Remover coluna antiga e renomear nova
ALTER TABLE withdrawals DROP COLUMN type;
ALTER TABLE withdrawals RENAME COLUMN withdrawal_type TO type;

-- Tornar a coluna NOT NULL
ALTER TABLE withdrawals ALTER COLUMN type SET NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN withdrawals.type IS 'Tipo de saque: residual (ganhos do sistema), referral (comissões), profit (lucros investimentos), pix (saque tradicional)';

-- Criar função para verificar limite de saque diário
CREATE OR REPLACE FUNCTION check_daily_withdrawal_limit(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_withdrawal_date DATE;
    today_date DATE;
BEGIN
    -- Buscar data do último saque
    SELECT DATE(created_at) INTO last_withdrawal_date
    FROM withdrawals 
    WHERE user_id = user_id_param 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Data de hoje
    today_date := CURRENT_DATE;
    
    -- Se não há saques ou o último saque não foi hoje, pode sacar
    IF last_withdrawal_date IS NULL OR last_withdrawal_date != today_date THEN
        RETURN TRUE;
    END IF;
    
    -- Se já sacou hoje, não pode sacar
    RETURN FALSE;
END;
$$;

-- Criar trigger para validar limite diário antes de inserir saque
CREATE OR REPLACE FUNCTION validate_daily_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se pode fazer saque hoje
    IF NOT check_daily_withdrawal_limit(NEW.user_id) THEN
        RAISE EXCEPTION 'Limite diário de saque atingido. Apenas 1 saque por dia permitido.';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger na tabela withdrawals
DROP TRIGGER IF EXISTS trigger_validate_daily_withdrawal ON withdrawals;
CREATE TRIGGER trigger_validate_daily_withdrawal
    BEFORE INSERT ON withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION validate_daily_withdrawal();

-- Adicionar índices para performance (removendo o problemático)
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_type ON withdrawals(type);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at);