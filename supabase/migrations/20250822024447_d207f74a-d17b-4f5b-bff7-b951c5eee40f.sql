-- Corrigir constraint de status na tabela digitopay_transactions
-- O status 'paid' não é aceito, deveria ser 'completed'

-- Verificar e corrigir constraint de status
ALTER TABLE digitopay_transactions DROP CONSTRAINT IF EXISTS digitopay_transactions_status_check;

-- Recriar constraint com valores corretos
ALTER TABLE digitopay_transactions 
ADD CONSTRAINT digitopay_transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'processing'));

-- Atualizar registros com status incorreto
UPDATE digitopay_transactions 
SET status = 'completed' 
WHERE status = 'paid';

-- Corrigir também a tabela deposits se necessário
ALTER TABLE deposits DROP CONSTRAINT IF EXISTS deposits_status_check;
ALTER TABLE deposits 
ADD CONSTRAINT deposits_status_check 
CHECK (status IN ('pending', 'paid', 'rejected', 'completed'));