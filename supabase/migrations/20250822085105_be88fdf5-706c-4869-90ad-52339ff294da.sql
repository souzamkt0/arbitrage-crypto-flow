-- Criar tabela de controle administrativo
CREATE TABLE IF NOT EXISTS public.admin_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    target_user_id UUID,
    target_email TEXT,
    permission_type TEXT NOT NULL, -- 'full_control', 'view_only', 'edit_profile', 'manage_balance', 'delete_user'
    permission_granted BOOLEAN DEFAULT true,
    granted_by TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_controls_admin_email ON public.admin_controls(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_controls_target_user ON public.admin_controls(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_controls_permission ON public.admin_controls(permission_type);

-- Habilitar RLS
ALTER TABLE public.admin_controls ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem ver e gerenciar
CREATE POLICY "Admins can view admin controls" 
ON public.admin_controls 
FOR SELECT 
USING (
    admin_email = 'admin@clean.com' OR 
    admin_email = 'souzamkt0@gmail.com' OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage admin controls" 
ON public.admin_controls 
FOR ALL 
USING (
    admin_email = 'admin@clean.com' OR 
    admin_email = 'souzamkt0@gmail.com' OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Inserir controle total para admin@clean.com
INSERT INTO public.admin_controls (
    admin_email,
    permission_type,
    permission_granted,
    granted_by
) VALUES 
('admin@clean.com', 'full_control', true, 'system'),
('admin@clean.com', 'view_all_users', true, 'system'),
('admin@clean.com', 'edit_all_profiles', true, 'system'),
('admin@clean.com', 'manage_all_balances', true, 'system'),
('admin@clean.com', 'delete_any_user', true, 'system'),
('admin@clean.com', 'manage_partners', true, 'system'),
('admin@clean.com', 'access_admin_panel', true, 'system'),
('admin@clean.com', 'impersonate_users', true, 'system')
ON CONFLICT DO NOTHING;

-- Criar função para verificar permissões administrativas
CREATE OR REPLACE FUNCTION public.has_admin_permission(
    admin_email_param TEXT,
    permission_type_param TEXT DEFAULT 'full_control'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- admin@clean.com sempre tem todas as permissões
    IF admin_email_param = 'admin@clean.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar na tabela de controles
    RETURN EXISTS (
        SELECT 1 FROM admin_controls 
        WHERE admin_email = admin_email_param 
        AND (permission_type = permission_type_param OR permission_type = 'full_control')
        AND permission_granted = true
    );
END;
$$;

-- Criar função para obter todas as permissões de um admin
CREATE OR REPLACE FUNCTION public.get_admin_permissions(admin_email_param TEXT)
RETURNS TABLE(
    permission_type TEXT,
    permission_granted BOOLEAN,
    granted_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.permission_type,
        ac.permission_granted,
        ac.granted_by,
        ac.created_at
    FROM admin_controls ac
    WHERE ac.admin_email = admin_email_param
    ORDER BY ac.created_at DESC;
END;
$$;

-- Dar permissões às funções
GRANT EXECUTE ON FUNCTION public.has_admin_permission(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_permission(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_permissions(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_permissions(TEXT) TO anon;

-- Verificar se as permissões foram criadas corretamente
SELECT 
    'Permissões criadas para admin@clean.com' as status,
    COUNT(*) as total_permissions
FROM admin_controls 
WHERE admin_email = 'admin@clean.com';