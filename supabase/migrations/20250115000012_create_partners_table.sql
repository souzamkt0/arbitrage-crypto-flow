-- Criar tabela específica para gerenciar sócios
-- Esta tabela permite adicionar usuários por email e ajustar a porcentagem de comissão

-- 1. Criar tabela partners
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 1.00 NOT NULL,
    total_earnings DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Admins podem ver todos os sócios
CREATE POLICY "Admins can view all partners" ON partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins podem inserir sócios
CREATE POLICY "Admins can insert partners" ON partners
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins podem atualizar sócios
CREATE POLICY "Admins can update partners" ON partners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins podem deletar sócios
CREATE POLICY "Admins can delete partners" ON partners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sócios podem ver apenas seus próprios dados
CREATE POLICY "Partners can view own data" ON partners
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Criar função para adicionar sócio por email
CREATE OR REPLACE FUNCTION add_partner_by_email(
    partner_email TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 1.00
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    partner_user_id UUID;
    partner_display_name TEXT;
    result JSON;
BEGIN
    -- Verificar se o usuário que está executando é admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas admins podem adicionar sócios'
        );
    END IF;

    -- Buscar o usuário pelo email
    SELECT id, display_name INTO partner_user_id, partner_display_name
    FROM profiles 
    WHERE email = partner_email;

    -- Se não encontrou o usuário, retornar erro
    IF partner_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado com este email'
        );
    END IF;

    -- Verificar se já é sócio
    IF EXISTS (SELECT 1 FROM partners WHERE email = partner_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário já é sócio'
        );
    END IF;

    -- Inserir na tabela partners
    INSERT INTO partners (
        user_id,
        email,
        display_name,
        commission_percentage
    ) VALUES (
        partner_user_id,
        partner_email,
        partner_display_name,
        commission_percentage
    );

    -- Atualizar o role do usuário para partner
    UPDATE profiles 
    SET role = 'partner'
    WHERE user_id = partner_user_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Sócio adicionado com sucesso',
        'partner_id', partner_user_id,
        'email', partner_email,
        'commission_percentage', commission_percentage
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 6. Criar função para atualizar comissão de sócio
CREATE OR REPLACE FUNCTION update_partner_commission(
    partner_email TEXT,
    new_commission_percentage DECIMAL(5,2)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verificar se o usuário que está executando é admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas admins podem atualizar comissões'
        );
    END IF;

    -- Atualizar a comissão
    UPDATE partners 
    SET 
        commission_percentage = new_commission_percentage,
        updated_at = NOW()
    WHERE email = partner_email;

    -- Verificar se foi atualizado
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Sócio não encontrado'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Comissão atualizada com sucesso',
        'email', partner_email,
        'new_commission_percentage', new_commission_percentage
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 7. Criar função para remover sócio
CREATE OR REPLACE FUNCTION remove_partner(
    partner_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    partner_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se o usuário que está executando é admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas admins podem remover sócios'
        );
    END IF;

    -- Buscar o user_id do sócio
    SELECT user_id INTO partner_user_id
    FROM partners 
    WHERE email = partner_email;

    -- Se não encontrou o sócio, retornar erro
    IF partner_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Sócio não encontrado'
        );
    END IF;

    -- Remover da tabela partners
    DELETE FROM partners WHERE email = partner_email;

    -- Atualizar o role do usuário para user
    UPDATE profiles 
    SET role = 'user'
    WHERE user_id = partner_user_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Sócio removido com sucesso',
        'email', partner_email
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 8. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION add_partner_by_email(TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_partner_commission(TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_partner(TEXT) TO authenticated;

-- 9. Comentários das funções
COMMENT ON FUNCTION add_partner_by_email(TEXT, DECIMAL) IS 'Adiciona um usuário como sócio por email';
COMMENT ON FUNCTION update_partner_commission(TEXT, DECIMAL) IS 'Atualiza a comissão de um sócio';
COMMENT ON FUNCTION remove_partner(TEXT) IS 'Remove um sócio';

-- 10. Inserir Admin Souza como sócio inicial (se não existir)
INSERT INTO partners (user_id, email, display_name, commission_percentage)
SELECT 
    p.user_id,
    p.email,
    p.display_name,
    1.00
FROM profiles p
WHERE p.email = 'souzamkt0@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM partners WHERE email = 'souzamkt0@gmail.com'
);
