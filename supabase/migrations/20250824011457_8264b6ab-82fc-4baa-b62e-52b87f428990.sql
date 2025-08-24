-- Verificar e corrigir as políticas RLS da tabela user_investments
-- O erro indica que não há políticas adequadas para INSERT

-- Primeiro, vamos verificar se a tabela tem RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_investments';

-- Verificar políticas existentes
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_investments';

-- Se não há políticas adequadas, vamos criar as políticas corretas
-- Política para usuários visualizarem seus próprios investimentos
CREATE POLICY "Users can view their own investments" ON user_investments
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios investimentos  
CREATE POLICY "Users can create their own investments" ON user_investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios investimentos
CREATE POLICY "Users can update their own investments" ON user_investments
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para admins gerenciarem todos os investimentos
CREATE POLICY "Admins can manage all investments" ON user_investments
    FOR ALL USING (is_admin(auth.uid()));

-- Verificar se RLS está habilitado na tabela
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;