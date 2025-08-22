-- Verificar e corrigir permissões para edição e exclusão de sócios

-- Verificar permissões atuais na tabela partners
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'partners'
ORDER BY cmd, policyname;

-- Adicionar permissões completas para admins na tabela partners
DROP POLICY IF EXISTS "Admins can delete partners" ON partners;
CREATE POLICY "Admins can delete partners" ON partners
FOR DELETE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update partners" ON partners;
CREATE POLICY "Admins can update partners" ON partners
FOR UPDATE USING (is_admin(auth.uid()));

-- Verificar se as funções de edição existem
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('remove_partner', 'update_partner_commission')
ORDER BY routine_name;

-- Criar função para remover sócio se não existir
CREATE OR REPLACE FUNCTION remove_partner_safe(partner_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    partner_user_id UUID;
    result JSON;
BEGIN
    -- Verificar se o usuário é admin
    IF NOT is_admin(auth.uid()) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas admins podem remover sócios'
        );
    END IF;

    -- Buscar o user_id do sócio
    SELECT user_id INTO partner_user_id
    FROM partners 
    WHERE email = partner_email;

    -- Se não encontrou o sócio
    IF partner_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Sócio não encontrado'
        );
    END IF;

    -- Remover da tabela partners
    DELETE FROM partners WHERE email = partner_email;

    -- Atualizar o role do usuário para user (se existir user_id)
    IF partner_user_id IS NOT NULL THEN
        UPDATE profiles 
        SET role = 'user'
        WHERE user_id = partner_user_id;
    END IF;

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

-- Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'partners'
AND policyname LIKE '%Admin%'
ORDER BY policyname;