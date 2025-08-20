-- Temporariamente desabilitar RLS para verificar se há dados
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;

-- Verificar dados na tabela
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;

-- Reabilitar RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Criar uma política mais permissiva para usuários autenticados verem dados de sócios
DROP POLICY IF EXISTS "Anyone authenticated can view partners" ON partners;

CREATE POLICY "Authenticated users can view partners" ON partners
    FOR SELECT 
    USING (true);

-- Verificar novamente com RLS habilitado
SELECT COUNT(*) as total_partners FROM partners;