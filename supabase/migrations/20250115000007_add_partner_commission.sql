-- Migração para adicionar sistema de sócios/VIP
-- Adicionar coluna partner_commission na tabela profiles

-- Verificar se a coluna partner_commission existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'partner_commission') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN partner_commission DECIMAL(5,2) DEFAULT 1.00;
    END IF;
END $$;

-- Verificar se a coluna partner_earnings existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'partner_earnings') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN partner_earnings DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- Verificar se a coluna partner_total_deposits existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'partner_total_deposits') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN partner_total_deposits DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- Criar tabela para registrar comissões de sócios
CREATE TABLE IF NOT EXISTS partner_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deposit_id UUID REFERENCES deposits(id) ON DELETE CASCADE,
    deposit_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_deposit_id ON partner_commissions(deposit_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_created_at ON partner_commissions(created_at);

-- Habilitar RLS na tabela partner_commissions
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para partner_commissions
CREATE POLICY "Partners can view their own commissions" ON partner_commissions
    FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "Admins can view all partner commissions" ON partner_commissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert partner commissions" ON partner_commissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update partner commissions" ON partner_commissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Função para calcular comissão de sócio automaticamente
CREATE OR REPLACE FUNCTION calculate_partner_commission()
RETURNS TRIGGER AS $$
DECLARE
    partner_record RECORD;
    commission_amount DECIMAL(15,2);
BEGIN
    -- Se o depósito foi aprovado, calcular comissões para todos os sócios
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Buscar todos os sócios
        FOR partner_record IN 
            SELECT user_id, partner_commission 
            FROM profiles 
            WHERE role = 'partner' 
            AND partner_commission > 0
        LOOP
            -- Calcular comissão
            commission_amount := NEW.amount_usd * (partner_record.partner_commission / 100);
            
            -- Registrar comissão
            INSERT INTO partner_commissions (
                partner_id,
                deposit_id,
                deposit_amount,
                commission_rate,
                commission_amount,
                status
            ) VALUES (
                partner_record.user_id,
                NEW.id,
                NEW.amount_usd,
                partner_record.partner_commission,
                commission_amount,
                'pending'
            );
            
            -- Atualizar saldo do sócio
            UPDATE profiles 
            SET 
                partner_earnings = partner_earnings + commission_amount,
                partner_total_deposits = partner_total_deposits + NEW.amount_usd,
                balance = balance + commission_amount
            WHERE user_id = partner_record.user_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular comissões automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_partner_commission ON deposits;
CREATE TRIGGER trigger_calculate_partner_commission
    AFTER UPDATE ON deposits
    FOR EACH ROW
    EXECUTE FUNCTION calculate_partner_commission();

-- Comentários informativos
COMMENT ON TABLE partner_commissions IS 'Registra comissões pagas aos sócios baseadas em depósitos aprovados';
COMMENT ON COLUMN profiles.partner_commission IS 'Percentual de comissão do sócio sobre depósitos aprovados';
COMMENT ON COLUMN profiles.partner_earnings IS 'Total de ganhos do sócio em comissões';
COMMENT ON COLUMN profiles.partner_total_deposits IS 'Total de depósitos que geraram comissão para o sócio';
