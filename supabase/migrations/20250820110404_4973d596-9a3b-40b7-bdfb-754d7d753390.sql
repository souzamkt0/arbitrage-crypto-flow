-- Verificar dados da tabela partners diretamente
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;

-- Listar políticas da tabela partners
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'partners' AND schemaname = 'public';

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'partners' AND schemaname = 'public';

-- Tentar habilitar RLS se não estiver
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;