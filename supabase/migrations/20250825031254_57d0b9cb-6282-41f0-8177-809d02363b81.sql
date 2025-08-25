-- Criar tabela para configurações da NOWPayments
CREATE TABLE public.nowpayments_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  ipn_secret TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox', -- sandbox ou production
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- RLS para nowpayments_config
ALTER TABLE public.nowpayments_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage nowpayments config" ON public.nowpayments_config
  FOR ALL USING (is_admin(auth.uid()));

-- Criar tabela para transações BNB20
CREATE TABLE public.bnb20_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_id TEXT, -- ID do pagamento na NOWPayments
  invoice_id TEXT, -- ID da invoice na NOWPayments
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount_usd NUMERIC NOT NULL,
  amount_bnb NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired', 'admin_approved', 'admin_rejected')),
  pay_address TEXT,
  payin_extra_id TEXT,
  pay_amount NUMERIC,
  pay_currency TEXT DEFAULT 'bnb',
  price_currency TEXT DEFAULT 'usd',
  qr_code_base64 TEXT,
  nowpayments_response JSONB,
  webhook_data JSONB,
  admin_notes TEXT,
  admin_approved_by UUID,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- RLS para bnb20_transactions
ALTER TABLE public.bnb20_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BNB20 transactions" ON public.bnb20_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own BNB20 transactions" ON public.bnb20_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all BNB20 transactions" ON public.bnb20_transactions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update BNB20 transactions" ON public.bnb20_transactions
  FOR UPDATE USING (is_admin(auth.uid()));

-- Criar tabela para webhooks da NOWPayments
CREATE TABLE public.nowpayments_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  signature TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para nowpayments_webhooks
ALTER TABLE public.nowpayments_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view nowpayments webhooks" ON public.nowpayments_webhooks
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert nowpayments webhooks" ON public.nowpayments_webhooks
  FOR INSERT WITH CHECK (true);

-- Criar tabela para aprovações de administrador
CREATE TABLE public.bnb20_admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.bnb20_transactions(id),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para bnb20_admin_approvals
ALTER TABLE public.bnb20_admin_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage BNB20 approvals" ON public.bnb20_admin_approvals
  FOR ALL USING (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_bnb20_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bnb20_transactions_updated_at
    BEFORE UPDATE ON public.bnb20_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_bnb20_transactions_updated_at();

-- Trigger para ativação automática de depósitos BNB20 aprovados
CREATE OR REPLACE FUNCTION auto_activate_bnb20_deposits()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'finished' ou 'admin_approved'
  IF (OLD.status != 'finished' AND NEW.status = 'finished') OR 
     (OLD.status != 'admin_approved' AND NEW.status = 'admin_approved') THEN
    
    -- Para depósitos, adicionar ao saldo
    IF NEW.type = 'deposit' THEN
      UPDATE profiles 
      SET 
        balance = balance + NEW.amount_usd,
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
        'nowpayments_bnb20',
        'deposit_approved',
        NEW.payment_id,
        json_build_object(
          'transaction_id', NEW.id,
          'user_id', NEW.user_id,
          'amount_usd', NEW.amount_usd,
          'amount_bnb', NEW.amount_bnb,
          'status', NEW.status
        ),
        'processed'
      );
      
    -- Para saques aprovados, subtrair do saldo se ainda não foi feito
    ELSIF NEW.type = 'withdrawal' AND NEW.status = 'admin_approved' THEN
      UPDATE profiles 
      SET 
        balance = balance - NEW.amount_usd,
        updated_at = NOW()
      WHERE user_id = NEW.user_id AND balance >= NEW.amount_usd;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER process_bnb20_transaction
    AFTER UPDATE ON public.bnb20_transactions
    FOR EACH ROW
    EXECUTE FUNCTION auto_activate_bnb20_deposits();

-- Função para validar webhooks da NOWPayments
CREATE OR REPLACE FUNCTION validate_nowpayments_webhook(
  signature TEXT,
  payload JSONB,
  secret TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  sorted_payload TEXT;
  computed_hash TEXT;
BEGIN
  -- Ordenar o JSON e computar o HMAC SHA512
  sorted_payload := (SELECT string_agg(key || ':' || value, ',') 
                     FROM jsonb_each_text(payload) 
                     ORDER BY key);
  
  computed_hash := encode(
    hmac(sorted_payload, secret, 'sha512'), 
    'hex'
  );
  
  RETURN computed_hash = signature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aprovar/rejeitar transações BNB20
CREATE OR REPLACE FUNCTION admin_approve_bnb20_transaction(
  transaction_id_param UUID,
  action_param TEXT,
  reason_param TEXT DEFAULT NULL,
  admin_email TEXT DEFAULT 'admin@clean.com'
)
RETURNS JSON AS $$
DECLARE
  transaction_record RECORD;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- Verificar se é admin
  IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas administradores autorizados podem aprovar transações'
    );
  END IF;

  -- Buscar ID do admin
  SELECT user_id INTO admin_user_id 
  FROM profiles 
  WHERE email = admin_email AND role = 'admin';

  IF admin_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Administrador não encontrado'
    );
  END IF;

  -- Buscar a transação
  SELECT * INTO transaction_record
  FROM bnb20_transactions 
  WHERE id = transaction_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transação não encontrada'
    );
  END IF;

  -- Atualizar status da transação
  IF action_param = 'approve' THEN
    UPDATE bnb20_transactions 
    SET 
      status = 'admin_approved',
      admin_approved_by = admin_user_id,
      admin_approved_at = NOW(),
      admin_notes = reason_param,
      updated_at = NOW()
    WHERE id = transaction_id_param;
  ELSE
    UPDATE bnb20_transactions 
    SET 
      status = 'admin_rejected',
      admin_approved_by = admin_user_id,
      admin_approved_at = NOW(),
      admin_notes = reason_param,
      updated_at = NOW()
    WHERE id = transaction_id_param;
  END IF;

  -- Registrar aprovação
  INSERT INTO bnb20_admin_approvals (
    transaction_id,
    admin_user_id,
    action,
    reason
  ) VALUES (
    transaction_id_param,
    admin_user_id,
    action_param,
    reason_param
  );

  RETURN json_build_object(
    'success', true,
    'message', CASE 
      WHEN action_param = 'approve' THEN 'Transação aprovada com sucesso'
      ELSE 'Transação rejeitada com sucesso'
    END,
    'transaction_id', transaction_id_param,
    'action', action_param,
    'admin_email', admin_email
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;