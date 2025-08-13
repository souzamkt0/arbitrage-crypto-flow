-- EXEMPLO: Como alterar colunas automaticamente no Supabase
-- Este arquivo demonstra diferentes tipos de alterações de colunas

-- 1. ADICIONAR NOVA COLUNA
ALTER TABLE public.user_investments 
ADD COLUMN IF NOT EXISTS nova_coluna text DEFAULT 'valor_padrao';

-- 2. ALTERAR TIPO DE COLUNA
ALTER TABLE public.user_investments 
ALTER COLUMN amount TYPE decimal(20,8);

-- 3. RENOMEAR COLUNA
ALTER TABLE public.user_investments 
RENAME COLUMN old_column_name TO new_column_name;

-- 4. ADICIONAR CONSTRAINT
ALTER TABLE public.user_investments 
ADD CONSTRAINT check_amount_positive CHECK (amount >= 0);

-- 5. REMOVER COLUNA
ALTER TABLE public.user_investments 
DROP COLUMN IF EXISTS coluna_desnecessaria;

-- 6. ALTERAR VALOR PADRÃO
ALTER TABLE public.user_investments 
ALTER COLUMN status SET DEFAULT 'active';

-- 7. TORNAR COLUNA NOT NULL
ALTER TABLE public.user_investments 
ALTER COLUMN user_id SET NOT NULL;

-- 8. REMOVER NOT NULL
ALTER TABLE public.user_investments 
ALTER COLUMN optional_field DROP NOT NULL;

-- 9. ADICIONAR ÍNDICE
CREATE INDEX IF NOT EXISTS idx_user_investments_status 
ON public.user_investments(status);

-- 10. REMOVER ÍNDICE
DROP INDEX IF EXISTS idx_old_index;

-- 11. ADICIONAR FOREIGN KEY
ALTER TABLE public.user_investments 
ADD CONSTRAINT fk_user_investments_plan_id 
FOREIGN KEY (plan_id) REFERENCES public.investment_plans(id);

-- 12. REMOVER CONSTRAINT
ALTER TABLE public.user_investments 
DROP CONSTRAINT IF EXISTS old_constraint_name;

-- 13. ATUALIZAR DADOS EXISTENTES
UPDATE public.user_investments 
SET status = 'migrated' 
WHERE status IS NULL;

-- 14. CRIAR NOVA TABELA
CREATE TABLE IF NOT EXISTS public.nova_tabela (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 15. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- 16. CRIAR POLICY
CREATE POLICY "Users can view their own records"
  ON public.nova_tabela FOR SELECT
  USING (auth.uid() = user_id);

-- 17. TRIGGER PARA UPDATED_AT
CREATE TRIGGER update_nova_tabela_updated_at
  BEFORE UPDATE ON public.nova_tabela
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMENTÁRIOS IMPORTANTES:
-- - Use sempre IF EXISTS/IF NOT EXISTS para evitar erros
-- - Teste as migrações em ambiente de desenvolvimento primeiro
-- - Faça backup antes de executar em produção
-- - Use transações para operações complexas
-- - Monitore o desempenho após alterações de índices