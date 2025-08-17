-- Migração para aplicar a constraint da coluna role e corrigir problemas
-- Esta migração será executada via RPC

-- Função para aplicar a migração da constraint
CREATE OR REPLACE FUNCTION apply_role_constraint_migration()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    constraint_exists BOOLEAN;
    constraint_values TEXT;
BEGIN
    -- Verificar se a constraint existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check' 
        AND table_name = 'profiles'
    ) INTO constraint_exists;
    
    -- Se a constraint existe, verificar seus valores
    IF constraint_exists THEN
        SELECT check_clause INTO constraint_values
        FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check' 
        AND table_name = 'profiles';
        
        -- Se não inclui 'partner', remover e recriar
        IF constraint_values NOT LIKE '%partner%' THEN
            ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
            ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('user', 'admin', 'partner'));
            
            RETURN 'Constraint atualizada para incluir "partner"';
        ELSE
            RETURN 'Constraint já inclui "partner"';
        END IF;
    ELSE
        -- Se não existe, criar
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'partner'));
        
        RETURN 'Constraint criada com "partner"';
    END IF;
END;
$$;

-- Função para verificar a estrutura da tabela
CREATE OR REPLACE FUNCTION get_table_structure(table_name TEXT)
RETURNS TABLE(
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT,
    check_clause TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT,
        cc.check_clause::TEXT
    FROM information_schema.columns c
    LEFT JOIN information_schema.check_constraints cc ON 
        cc.table_name = c.table_name AND 
        cc.constraint_name LIKE '%' || c.column_name || '%'
    WHERE c.table_name = $1
    ORDER BY c.ordinal_position;
END;
$$;

-- Permitir que usuários autenticados usem as funções
GRANT EXECUTE ON FUNCTION apply_role_constraint_migration() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_structure(TEXT) TO authenticated;

-- Comentários das funções
COMMENT ON FUNCTION apply_role_constraint_migration() IS 'Aplica a migração da constraint da coluna role';
COMMENT ON FUNCTION get_table_structure(TEXT) IS 'Retorna a estrutura de uma tabela';
