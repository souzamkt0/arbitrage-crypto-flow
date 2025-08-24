-- Habilitar RLS na tabela user_investments se não estiver habilitada
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam conflitar
DROP POLICY IF EXISTS "Admins can do everything on user_investments" ON user_investments;
DROP POLICY IF EXISTS "Admins can view all user_investments" ON user_investments;
DROP POLICY IF EXISTS "Admins can delete user_investments" ON user_investments;
DROP POLICY IF EXISTS "Admins can update user_investments" ON user_investments;

-- Criar políticas completas para administradores
CREATE POLICY "admin_full_access_user_investments"
ON user_investments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Permitir que usuários vejam apenas seus próprios investimentos
CREATE POLICY "users_own_investments_select"
ON user_investments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permitir que usuários criem seus próprios investimentos
CREATE POLICY "users_own_investments_insert"
ON user_investments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem seus próprios investimentos
CREATE POLICY "users_own_investments_update"
ON user_investments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);