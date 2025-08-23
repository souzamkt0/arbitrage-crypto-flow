-- Verificar se tabela de contratos existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%contract%';

-- Criar tabela de contratos ativos se não existir
CREATE TABLE IF NOT EXISTS public.user_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_type VARCHAR(50) NOT NULL DEFAULT 'investment',
  plan_name VARCHAR(100) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  daily_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0250,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  auto_renewal BOOLEAN DEFAULT false,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  last_earning_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_contracts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own contracts" 
ON public.user_contracts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" 
ON public.user_contracts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" 
ON public.user_contracts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all contracts" 
ON public.user_contracts 
FOR ALL 
USING (is_admin(auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_contracts_user_id ON public.user_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contracts_status ON public.user_contracts(status);
CREATE INDEX IF NOT EXISTS idx_user_contracts_end_date ON public.user_contracts(end_date);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_contracts_updated_at
    BEFORE UPDATE ON public.user_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_contracts_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.user_contracts IS 'Tabela para contratos ativos dos usuários com planos de investimento';
COMMENT ON COLUMN public.user_contracts.contract_type IS 'Tipo do contrato: investment, arbitrage, premium';
COMMENT ON COLUMN public.user_contracts.status IS 'Status: active, paused, expired, cancelled';
COMMENT ON COLUMN public.user_contracts.daily_rate IS 'Taxa de rendimento diário (ex: 0.0250 = 2.5%)';
COMMENT ON COLUMN public.user_contracts.auto_renewal IS 'Se o contrato renova automaticamente';