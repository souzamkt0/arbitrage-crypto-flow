-- Diagnosticar e corrigir problema de RLS na tabela user_investments

-- 1. Verificar se as políticas estão ativas 
SELECT schemaname, tablename, rowsecurity as rls_enabled 
FROM pg_tables 
WHERE tablename = 'user_investments';

-- 2. Verificar o contexto de autenticação atual
SELECT 
  current_user,
  session_user,
  auth.uid() as auth_user_id,
  auth.role() as auth_role;

-- 3. Testar se a função is_admin funciona para o usuário atual
SELECT is_admin(auth.uid()) as is_current_user_admin;

-- 4. Verificar se o usuário existe na tabela profiles
SELECT user_id, email, role, status 
FROM profiles 
WHERE user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944';

-- 5. Corrigir políticas RLS - remover e recriar de forma mais simples
DROP POLICY IF EXISTS "Users can create their own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can view their own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON user_investments;

-- Criar políticas mais permissivas para debug
CREATE POLICY "users_insert_user_investments" ON user_investments
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_user_investments" ON user_investments
  FOR SELECT 
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "users_update_user_investments" ON user_investments
  FOR UPDATE 
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 6. Verificar se RLS está ativo
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;