-- Corrigir o problema de RLS na tabela user_investments
-- O problema é que user_id é nullable mas a política RLS requer que seja não-null

-- Primeiro, alterar a coluna user_id para NOT NULL
ALTER TABLE public.user_investments 
ALTER COLUMN user_id SET NOT NULL;

-- Verificar se todas as políticas RLS estão corretas
-- Remover política duplicada se existir
DO $$ 
BEGIN
    -- Verificar se a política existe antes de tentar removê-la
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can create their own investments' 
        AND tablename = 'user_investments'
    ) THEN
        DROP POLICY "Users can create their own investments" ON public.user_investments;
    END IF;
END $$;

-- Recriar a política de INSERT mais robusta
CREATE POLICY "Users can create their own investments" 
ON public.user_investments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Garantir que também podem ver seus próprios investimentos
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can view their own investments' 
        AND tablename = 'user_investments'
    ) THEN
        DROP POLICY "Users can view their own investments" ON public.user_investments;
    END IF;
END $$;

CREATE POLICY "Users can view their own investments" 
ON public.user_investments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Adicionar política para UPDATE se não existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update their own investments' 
        AND tablename = 'user_investments'
    ) THEN
        DROP POLICY "Users can update their own investments" ON public.user_investments;
    END IF;
END $$;

CREATE POLICY "Users can update their own investments" 
ON public.user_investments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);