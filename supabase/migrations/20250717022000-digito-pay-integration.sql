-- DigitoPay Integration Tables

-- 1. DIGITOPAY_TRANSACTIONS TABLE (Transações do DigitoPay)
CREATE TABLE public.digitopay_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trx_id text UNIQUE NOT NULL, -- ID da transação do DigitoPay
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount decimal(15,2) NOT NULL,
  amount_brl decimal(15,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  pix_code text, -- Código PIX para depósitos
  qr_code_base64 text, -- QR Code em base64
  pix_key text, -- Chave PIX para saques
  pix_key_type text CHECK (pix_key_type IN ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP')),
  person_name text,
  person_cpf text,
  callback_data jsonb, -- Dados recebidos do webhook
  gateway_response jsonb, -- Resposta completa da API
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. DIGITOPAY_DEBUG TABLE (Logs de Debug)
CREATE TABLE public.digitopay_debug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trx_id text,
  tipo text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Adicionar campos CPF na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- 4. Criar índices para performance
CREATE INDEX idx_digitopay_transactions_user_id ON public.digitopay_transactions(user_id);
CREATE INDEX idx_digitopay_transactions_trx_id ON public.digitopay_transactions(trx_id);
CREATE INDEX idx_digitopay_transactions_status ON public.digitopay_transactions(status);
CREATE INDEX idx_digitopay_debug_tipo ON public.digitopay_debug(tipo);

-- 5. Habilitar RLS
ALTER TABLE public.digitopay_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digitopay_debug ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para digitopay_transactions
CREATE POLICY "Users can view their own transactions" ON public.digitopay_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.digitopay_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.digitopay_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Políticas RLS para digitopay_debug (apenas admin)
CREATE POLICY "Admin can view debug logs" ON public.digitopay_debug
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert debug logs" ON public.digitopay_debug
  FOR INSERT WITH CHECK (true);

-- 8. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Triggers para updated_at
CREATE TRIGGER update_digitopay_transactions_updated_at 
  BEFORE UPDATE ON public.digitopay_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Função para processar webhook de depósito
CREATE OR REPLACE FUNCTION process_digitopay_deposit_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para completed, atualizar o saldo do usuário
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET balance = balance + NEW.amount
    WHERE user_id = NEW.user_id;
    
    -- Registrar na tabela de depósitos
    INSERT INTO public.deposits (
      user_id, amount_usd, amount_brl, type, status, 
      holder_name, cpf, pix_code, exchange_rate
    ) VALUES (
      NEW.user_id, NEW.amount, NEW.amount_brl, 'pix', 'paid',
      NEW.person_name, NEW.person_cpf, NEW.pix_code, 5.40
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger para processar webhook
CREATE TRIGGER digitopay_deposit_webhook_trigger
  AFTER UPDATE ON public.digitopay_transactions
  FOR EACH ROW EXECUTE FUNCTION process_digitopay_deposit_webhook(); 