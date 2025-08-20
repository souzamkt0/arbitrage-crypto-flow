-- Verificar se RLS está habilitado na tabela partners
SELECT schemaname, tablename, rowsecurity, hasrls 
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE tablename = 'partners' AND schemaname = 'public';

-- Listar todas as políticas da tabela partners
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'partners';

-- Verificar dados na tabela partners
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;

-- Tentar uma consulta simples como usuário autenticado
SELECT COUNT(*) as total_partners FROM partners;