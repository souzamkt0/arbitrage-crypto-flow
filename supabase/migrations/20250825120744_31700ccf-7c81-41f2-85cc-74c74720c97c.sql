-- Drop foreign key constraints if they exist
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Simplify the payments table structure
ALTER TABLE public.payments DROP COLUMN IF EXISTS payment_address;
ALTER TABLE public.payments DROP COLUMN IF EXISTS currency_from;
ALTER TABLE public.payments DROP COLUMN IF EXISTS actually_paid;
ALTER TABLE public.payments DROP COLUMN IF EXISTS price_amount;
ALTER TABLE public.payments DROP COLUMN IF EXISTS order_description;
ALTER TABLE public.payments DROP COLUMN IF EXISTS webhook_data;
ALTER TABLE public.payments DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.payments DROP COLUMN IF EXISTS currency_to;
ALTER TABLE public.payments DROP COLUMN IF EXISTS user_id;

-- Rename amount to amount_usd if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_usd') THEN
        ALTER TABLE public.payments RENAME COLUMN amount TO amount_usd;
    END IF;
END $$;

-- Change amount_usd to DECIMAL type
ALTER TABLE public.payments ALTER COLUMN amount_usd TYPE DECIMAL;

-- Disable Row Level Security
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;