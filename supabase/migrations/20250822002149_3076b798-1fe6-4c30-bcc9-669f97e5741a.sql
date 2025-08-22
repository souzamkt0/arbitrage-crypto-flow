-- Corrigir tabela user_roles e garantir acesso total para admins
CREATE POLICY "Admins have full control over user_roles" ON user_roles 
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles" ON user_roles 
FOR SELECT USING (user_id = auth.uid());

-- Garantir que dagosaraiva@hotmail.com seja admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'dagosaraiva@hotmail.com';

-- Verificar e garantir que admin@clean.com também seja admin  
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@clean.com';

-- Verificar se souzamkt0@gmail.com existe e fazer admin
INSERT INTO profiles (user_id, email, display_name, role, status)
VALUES (gen_random_uuid(), 'souzamkt0@gmail.com', 'Admin Souza', 'admin', 'active')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Criar uma política de bypass especial para emails de admin hardcoded
CREATE OR REPLACE FUNCTION public.is_admin_email(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_email IN ('admin@clean.com', 'souzamkt0@gmail.com', 'dagosaraiva@hotmail.com')
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = check_email 
    AND role = 'admin'
  );
$$;

-- Política de bypass para admins mesmo sem auth.uid()
CREATE POLICY "Bypass for admin emails on profiles" ON profiles 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.email IN ('admin@clean.com', 'souzamkt0@gmail.com', 'dagosaraiva@hotmail.com')
    AND p.role = 'admin'
  )
);