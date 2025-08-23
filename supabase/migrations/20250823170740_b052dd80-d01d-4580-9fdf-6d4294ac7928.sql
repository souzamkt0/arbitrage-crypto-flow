-- Atualizar tabela withdrawals para suportar tipos específicos de saque
-- Adicionar enum para tipos de saque se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_type') THEN
        CREATE TYPE withdrawal_type AS ENUM ('residual', 'referral', 'profit', 'pix');
    END IF;
END $$;

-- Alterar coluna type para usar o enum
ALTER TABLE withdrawals ALTER COLUMN type TYPE withdrawal_type USING type::withdrawal_type;

-- Adicionar comentários explicativos
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

-- Atualizar RLS policies para incluir novos tipos
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON withdrawals;
CREATE POLICY "Users can create their own withdrawals" 
ON withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own withdrawals" ON withdrawals;
CREATE POLICY "Users can view their own withdrawals" 
ON withdrawals 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy para admins verem todos os saques
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
CREATE POLICY "Admins can view all withdrawals" 
ON withdrawals 
FOR ALL
USING (is_admin(auth.uid()));

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_date ON withdrawals(user_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_withdrawals_type ON withdrawals(type);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);