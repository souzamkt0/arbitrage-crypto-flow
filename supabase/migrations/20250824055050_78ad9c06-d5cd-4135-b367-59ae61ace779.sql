-- Habilitar replica identity para sincronização em tempo real
ALTER TABLE investment_plans REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação do realtime
ALTER publication supabase_realtime ADD TABLE investment_plans;

-- Criar função para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION update_investment_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_investment_plans_updated_at ON investment_plans;
CREATE TRIGGER trigger_update_investment_plans_updated_at
    BEFORE UPDATE ON investment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_investment_plans_updated_at();