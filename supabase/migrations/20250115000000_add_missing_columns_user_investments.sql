-- Migração completa para corrigir a tabela user_investments
-- Adicionar todas as colunas necessárias que estão faltando

-- Verificar se a coluna investment_plan_id existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'investment_plan_id') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN investment_plan_id VARCHAR(255);
    END IF;
END $$;

-- Verificar se a coluna daily_target existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'daily_target') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN daily_target DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Verificar se a coluna days_remaining existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'days_remaining') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN days_remaining INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar se a coluna total_operations existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'total_operations') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN total_operations INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar se a coluna daily_rate existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'daily_rate') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN daily_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
END $$;

-- Verificar se a coluna start_date existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'start_date') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Verificar se a coluna end_date existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'end_date') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Verificar se a coluna status existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_investments' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.user_investments 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- Comentário informativo
-- Esta migração adiciona todas as colunas necessárias para o funcionamento
-- correto do sistema de investimentos, incluindo:
-- - investment_plan_id: ID do plano de investimento
-- - daily_target: Meta de ganho diário
-- - days_remaining: Dias restantes do investimento
-- - total_operations: Total de operações
-- - daily_rate: Taxa diária de rendimento
-- - start_date: Data de início do investimento
-- - end_date: Data de fim do investimento
-- - status: Status do investimento (active/completed)