-- Criar políticas RLS para administradores verem todos os dados

-- Adicionar política para admins verem todos os profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Adicionar política para admins verem todos os deposits
CREATE POLICY "Admins can view all deposits" 
ON public.deposits 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Adicionar política para admins verem todos os withdrawals  
CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Adicionar política para admins verem todos os user_investments
CREATE POLICY "Admins can view all user investments"
ON public.user_investments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Verificar se já existe policy para admins no investment_plans, se não criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investment_plans' 
    AND policyname = 'Admins can manage investment plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage investment plans" ON public.investment_plans FOR ALL USING (is_admin(auth.uid()))';
  END IF;
END $$;