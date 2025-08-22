-- Verificar e corrigir políticas RLS para user_investments
-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view their own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON user_investments;

-- Criar políticas RLS corretas
CREATE POLICY "Users can view their own investments" 
ON user_investments FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own investments" 
ON user_investments FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own investments" 
ON user_investments FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verificar se RLS está habilitado
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;