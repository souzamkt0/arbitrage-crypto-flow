-- Migração para corrigir a constraint da coluna role
-- Adicionar 'partner' como valor válido para a coluna role

-- Primeiro, vamos verificar se a constraint existe e quais valores ela permite
DO $$
BEGIN
    -- Verificar se a constraint profiles_role_check existe
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check' 
        AND table_name = 'profiles'
    ) THEN
        -- Remover a constraint antiga
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        
        -- Criar nova constraint que inclui 'partner'
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'partner'));
        
        RAISE NOTICE 'Constraint profiles_role_check atualizada para incluir "partner"';
    ELSE
        -- Se não existe, criar a constraint
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'partner'));
        
        RAISE NOTICE 'Constraint profiles_role_check criada com "partner"';
    END IF;
END $$;

-- Verificar se a alteração foi aplicada
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'profiles' 
AND constraint_name = 'profiles_role_check';

-- Comentário informativo
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 'Permite valores: user, admin, partner';

