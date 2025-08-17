-- Criar tabela para registrar ganhos de trading
CREATE TABLE IF NOT EXISTS trading_profits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    investment_amount DECIMAL(15,2) NOT NULL,
    daily_rate DECIMAL(5,2) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    total_profit DECIMAL(15,2) NOT NULL,
    exchanges_count INTEGER NOT NULL,
    completed_operations INTEGER NOT NULL,
    execution_time_seconds INTEGER,
    profit_per_exchange DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trading_profits_user_id ON trading_profits(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_profits_created_at ON trading_profits(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_profits_plan_name ON trading_profits(plan_name);

-- Habilitar Row Level Security
ALTER TABLE trading_profits ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own trading profits" ON trading_profits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading profits" ON trading_profits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading profits" ON trading_profits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading profits" ON trading_profits
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_trading_profits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_trading_profits_updated_at
    BEFORE UPDATE ON trading_profits
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_profits_updated_at();

-- Função para calcular estatísticas de ganhos
CREATE OR REPLACE FUNCTION get_user_trading_stats(user_uuid UUID)
RETURNS TABLE (
    total_invested DECIMAL(15,2),
    total_profit DECIMAL(15,2),
    total_operations INTEGER,
    avg_daily_rate DECIMAL(5,2),
    best_profit DECIMAL(15,2),
    total_execution_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(tp.investment_amount), 0) as total_invested,
        COALESCE(SUM(tp.total_profit), 0) as total_profit,
        COALESCE(SUM(tp.completed_operations), 0) as total_operations,
        COALESCE(AVG(tp.daily_rate), 0) as avg_daily_rate,
        COALESCE(MAX(tp.total_profit), 0) as best_profit,
        COALESCE(SUM(tp.execution_time_seconds), 0) as total_execution_time
    FROM trading_profits tp
    WHERE tp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
