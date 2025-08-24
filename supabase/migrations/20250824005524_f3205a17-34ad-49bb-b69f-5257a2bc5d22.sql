-- Adicionar colunas que podem estar faltando na tabela user_investments
ALTER TABLE public.user_investments 
ADD COLUMN IF NOT EXISTS daily_target DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS days_remaining INTEGER DEFAULT 30;

-- Comentários para documentação
COMMENT ON COLUMN public.user_investments.daily_target IS 'Meta diária de lucro em USDT';
COMMENT ON COLUMN public.user_investments.days_remaining IS 'Dias restantes do investimento';