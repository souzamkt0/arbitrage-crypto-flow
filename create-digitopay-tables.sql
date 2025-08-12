-- SCRIPT PARA CRIAR TABELAS DO DIGITOPAY
-- Execute este script no SQL Editor do Supabase

-- 1. DIGITOPAY_TRANSACTIONS TABLE (Transações do DigitoPay)
CREATE TABLE IF NOT EXISTS public.digitopay_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trx_id text NOT NULL UNIQUE, -- ID da transação no DigitoPay
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount decimal(15,2) NOT NULL,
  amount_brl decimal(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  pix_code text,
  qr_code_base64 text,
  pix_key text,
  pix_key_type text CHECK (pix_key_type IN ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')),
  person_name text,
  person_cpf text,
  gateway_response jsonb, -- Resposta completa da API do DigitoPay
  callback_data jsonb, -- Dados recebidos via webhook
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. DIGITOPAY_DEBUG TABLE (Logs de Debug do DigitoPay)
CREATE TABLE IF NOT EXISTS public.digitopay_debug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL, -- Tipo de operação (authenticate, createDeposit, etc.)
  payload jsonb NOT NULL, -- Dados completos da operação
  created_at timestamp with time zone DEFAULT now()
);

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_user_id ON public.digitopay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_trx_id ON public.digitopay_transactions(trx_id);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_status ON public.digitopay_transactions(status);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_type ON public.digitopay_transactions(type);
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_tipo ON public.digitopay_debug(tipo);
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_created_at ON public.digitopay_debug(created_at);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.digitopay_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digitopay_debug ENABLE ROW LEVEL SECURITY;

-- 5. FUNÇÃO PARA VERIFICAR SE É ADMIN (se não existir)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. POLICIES DE SEGURANÇA

-- Políticas para digitopay_transactions
DROP POLICY IF EXISTS "Users can view their own digitopay transactions" ON public.digitopay_transactions;
CREATE POLICY "Users can view their own digitopay transactions"
  ON public.digitopay_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own digitopay transactions" ON public.digitopay_transactions;
CREATE POLICY "Users can create their own digitopay transactions"
  ON public.digitopay_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all digitopay transactions" ON public.digitopay_transactions;
CREATE POLICY "Admins can view all digitopay transactions"
  ON public.digitopay_transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update digitopay transactions" ON public.digitopay_transactions;
CREATE POLICY "Admins can update digitopay transactions"
  ON public.digitopay_transactions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Políticas para digitopay_debug (apenas admin)
DROP POLICY IF EXISTS "Admins can view all digitopay debug logs" ON public.digitopay_debug;
CREATE POLICY "Admins can view all digitopay debug logs"
  ON public.digitopay_debug FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert digitopay debug logs" ON public.digitopay_debug;
CREATE POLICY "System can insert digitopay debug logs"
  ON public.digitopay_debug FOR INSERT
  WITH CHECK (true);

-- 7. TRIGGER PARA UPDATED_AT
DROP TRIGGER IF EXISTS update_digitopay_transactions_updated_at ON public.digitopay_transactions;
CREATE TRIGGER update_digitopay_transactions_updated_at
  BEFORE UPDATE ON public.digitopay_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. VERIFICAR SE AS TABELAS FORAM CRIADAS
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'digitopay_transactions' THEN '✅ Criada'
    WHEN table_name = 'digitopay_debug' THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('digitopay_transactions', 'digitopay_debug'); 