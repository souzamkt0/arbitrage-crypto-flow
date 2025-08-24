-- Adicionar colunas que estão faltando na tabela user_investments
ALTER TABLE public.user_investments 
ADD COLUMN IF NOT EXISTS investment_plan_id UUID;

-- Remover a coluna duplicada plan_id se ela existir e usar investment_plan_id como referência principal
-- Primeiro vamos verificar se há dados na tabela
DO $$
BEGIN
  -- Se há dados na coluna plan_id, vamos copiar para investment_plan_id
  UPDATE public.user_investments 
  SET investment_plan_id = plan_id 
  WHERE investment_plan_id IS NULL AND plan_id IS NOT NULL;
  
  -- Agora podemos remover a coluna plan_id se ela existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_investments' 
    AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE public.user_investments DROP COLUMN plan_id;
  END IF;
  
  -- Tornar investment_plan_id obrigatório
  ALTER TABLE public.user_investments 
  ALTER COLUMN investment_plan_id SET NOT NULL;
  
END $$;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_investments_investment_plan_id 
ON public.user_investments(investment_plan_id);

-- Comentário para documentação
COMMENT ON COLUMN public.user_investments.investment_plan_id IS 'Referência ao plano de investimento da tabela investment_plans';