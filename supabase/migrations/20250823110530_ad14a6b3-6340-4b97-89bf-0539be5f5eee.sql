-- Criar tabela para logs de webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'digitopay',
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider_external_id ON webhook_logs(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at);

-- Adicionar coluna external_id na tabela digitopay_transactions se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digitopay_transactions' 
    AND column_name = 'external_id'
  ) THEN
    ALTER TABLE digitopay_transactions ADD COLUMN external_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_external_id ON digitopay_transactions(external_id);
  END IF;
END $$;

-- Função para processar ativação automática de saldo
CREATE OR REPLACE FUNCTION process_digitopay_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    
    -- Para depósitos, adicionar ao saldo
    IF NEW.type = 'deposit' THEN
      UPDATE profiles 
      SET 
        balance = balance + NEW.amount,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      -- Log da ativação
      INSERT INTO webhook_logs (
        provider,
        event_type,
        external_id,
        payload,
        status
      ) VALUES (
        'digitopay_auto',
        'deposit_completed',
        NEW.external_id,
        json_build_object(
          'transaction_id', NEW.id,
          'user_id', NEW.user_id,
          'amount', NEW.amount,
          'amount_brl', NEW.amount_brl
        ),
        'processed'
      );
      
    -- Para saques, subtrair do saldo  
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE profiles 
      SET 
        balance = balance - NEW.amount,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      -- Log da ativação
      INSERT INTO webhook_logs (
        provider,
        event_type,
        external_id,
        payload,
        status
      ) VALUES (
        'digitopay_auto',
        'withdrawal_completed',
        NEW.external_id,
        json_build_object(
          'transaction_id', NEW.id,
          'user_id', NEW.user_id,
          'amount', NEW.amount,
          'amount_brl', NEW.amount_brl
        ),
        'processed'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para ativação automática (remove se existir)
DROP TRIGGER IF EXISTS trigger_auto_activate_digitopay ON digitopay_transactions;

CREATE TRIGGER trigger_auto_activate_digitopay
  AFTER UPDATE ON digitopay_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_digitopay_transaction();

-- RLS para webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all webhook logs" ON webhook_logs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert webhook logs" ON webhook_logs
  FOR INSERT WITH CHECK (true);