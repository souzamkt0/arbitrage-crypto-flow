-- Primeiro, remover todas as políticas RLS da tabela payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public payment creation" ON public.payments;
DROP POLICY IF EXISTS "System can view public payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- Remover constraints de foreign key se existirem
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Simplificar a estrutura da tabela payments
ALTER TABLE public.payments DROP COLUMN IF EXISTS payment_address CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS currency_from CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS actually_paid CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS price_amount CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS order_description CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS webhook_data CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS updated_at CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS currency_to CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS user_id CASCADE;

-- Renomear coluna amount para amount_usd se necessário
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_usd') THEN
        ALTER TABLE public.payments RENAME COLUMN amount TO amount_usd;
    END IF;
END $$;

-- Alterar tipo da coluna amount_usd para DECIMAL
ALTER TABLE public.payments ALTER COLUMN amount_usd TYPE DECIMAL;

-- Desabilitar Row Level Security
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;