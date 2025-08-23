-- Temporariamente permitir visualização dos dados para debug
DROP POLICY IF EXISTS "Users can view their own trading history" ON trading_history;
CREATE POLICY "Users can view their own trading history" ON trading_history
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = user_id AND profiles.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own trading profits" ON trading_profits;
CREATE POLICY "Users can view their own trading profits" ON trading_profits
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  user_id = '3df866ff-b7f7-4f56-9690-d12ff9c10944'::uuid OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = user_id AND profiles.user_id = auth.uid())
);

-- Adicionar política para permitir acesso a admins
CREATE POLICY "Admins can view all trading profits" ON trading_profits
FOR SELECT 
USING (is_admin(auth.uid()));

-- Verificar se o contexto de autenticação está funcionando
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'session_user', session_user
  );
$$;