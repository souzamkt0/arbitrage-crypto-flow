-- Adicionar políticas RLS faltantes para administradores

-- Política para admins verem todos os profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()))';
  END IF;
END $$;

-- Política para admins verem todos os user_investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_investments' 
    AND policyname = 'Admins can view all user investments'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all user investments" ON public.user_investments FOR SELECT USING (is_admin(auth.uid()))';
  END IF;
END $$;

-- Política para admins gerenciarem investment_plans
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