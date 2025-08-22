-- Verificar e corrigir políticas RLS para user_investments
-- Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "Users can view own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can update own investments" ON user_investments;

-- Criar política RLS simples e funcional para visualizar investimentos
CREATE POLICY "Users can view their own investments" 
ON user_investments 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para inserir novos investimentos
CREATE POLICY "Users can create their own investments" 
ON user_investments 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Política para atualizar investimentos (necessário para operações)
CREATE POLICY "Users can update their own investments" 
ON user_investments 
FOR UPDATE 
USING (user_id = auth.uid());

-- Verificar se RLS está habilitado
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;