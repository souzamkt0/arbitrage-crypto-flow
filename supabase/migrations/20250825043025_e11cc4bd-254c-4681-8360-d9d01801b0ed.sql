-- Verificar e corrigir tabela bnb20_transactions
-- Adicionar trigger para updated_at se não existir

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_bnb20_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_bnb20_transactions_updated_at_trigger ON bnb20_transactions;

-- Criar trigger para updated_at
CREATE TRIGGER update_bnb20_transactions_updated_at_trigger
    BEFORE UPDATE ON bnb20_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_bnb20_transactions_updated_at();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_user_id ON bnb20_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_payment_id ON bnb20_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_status ON bnb20_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bnb20_transactions_created_at ON bnb20_transactions(created_at DESC);

-- Verificar se existem registros de teste
SELECT COUNT(*) as total_records FROM bnb20_transactions;