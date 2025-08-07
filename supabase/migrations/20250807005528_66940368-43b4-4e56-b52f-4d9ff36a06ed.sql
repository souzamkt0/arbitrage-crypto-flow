-- Criar tabela para registrar transações administrativas de saldo
CREATE TABLE IF NOT EXISTS public.admin_balance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  admin_user_id uuid NOT NULL,
  amount_before numeric NOT NULL DEFAULT 0,
  amount_after numeric NOT NULL DEFAULT 0,
  amount_changed numeric NOT NULL DEFAULT 0,
  transaction_type text NOT NULL DEFAULT 'balance_adjustment',
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_balance_transactions ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todas as transações
CREATE POLICY "Admins can view all admin balance transactions" 
ON public.admin_balance_transactions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Política para admins criarem transações
CREATE POLICY "Admins can create admin balance transactions" 
ON public.admin_balance_transactions 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admin_balance_transactions_updated_at
BEFORE UPDATE ON public.admin_balance_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();