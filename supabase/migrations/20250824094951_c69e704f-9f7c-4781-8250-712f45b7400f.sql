-- Criar tabela para logs de ações administrativas
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'edit', 'ban', 'unban', 'delete', 'balance_update'
  details JSONB DEFAULT '{}',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todos os logs
CREATE POLICY "Admins can view all action logs" ON admin_action_logs 
FOR SELECT USING (is_admin(auth.uid()));

-- Política para admins criarem logs
CREATE POLICY "Admins can create action logs" ON admin_action_logs 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Função para banir/desbanir usuário
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(
  target_user_id UUID,
  reason TEXT DEFAULT 'Ação administrativa',
  admin_email TEXT DEFAULT 'admin@clean.com'
) RETURNS JSON AS $$
DECLARE
  current_status TEXT;
  new_status TEXT;
  user_email TEXT;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- Verificar se o admin tem permissão
  IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores autorizados'
    );
  END IF;

  -- Buscar admin_user_id
  SELECT user_id INTO admin_user_id 
  FROM profiles 
  WHERE email = admin_email 
  AND role = 'admin';

  -- Buscar status atual e email do usuário
  SELECT status, email INTO current_status, user_email
  FROM profiles 
  WHERE user_id = target_user_id;

  IF current_status IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;

  -- Não permitir banir outros admins
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = target_user_id 
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Não é possível banir outros administradores'
    );
  END IF;

  -- Determinar novo status
  new_status := CASE 
    WHEN current_status = 'active' THEN 'banned'
    ELSE 'active'
  END;

  -- Atualizar status
  UPDATE profiles 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Registrar log da ação
  INSERT INTO admin_action_logs (
    admin_user_id,
    target_user_id,
    action_type,
    details,
    reason
  ) VALUES (
    admin_user_id,
    target_user_id,
    CASE WHEN new_status = 'banned' THEN 'ban' ELSE 'unban' END,
    json_build_object(
      'old_status', current_status,
      'new_status', new_status,
      'user_email', user_email
    ),
    reason
  );

  RETURN json_build_object(
    'success', true,
    'message', CASE 
      WHEN new_status = 'banned' THEN 'Usuário banido com sucesso'
      ELSE 'Usuário desbanido com sucesso'
    END,
    'user_email', user_email,
    'old_status', current_status,
    'new_status', new_status
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para deletar usuário (soft delete)
CREATE OR REPLACE FUNCTION admin_delete_user(
  target_user_id UUID,
  reason TEXT DEFAULT 'Usuário deletado pelo administrador',
  admin_email TEXT DEFAULT 'admin@clean.com'
) RETURNS JSON AS $$
DECLARE
  user_email TEXT;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- Verificar se o admin tem permissão
  IF NOT (admin_email = 'admin@clean.com' OR admin_email = 'souzamkt0@gmail.com') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores autorizados'
    );
  END IF;

  -- Buscar admin_user_id
  SELECT user_id INTO admin_user_id 
  FROM profiles 
  WHERE email = admin_email 
  AND role = 'admin';

  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM profiles 
  WHERE user_id = target_user_id;

  IF user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;

  -- Não permitir deletar outros admins
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = target_user_id 
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Não é possível deletar outros administradores'
    );
  END IF;

  -- Soft delete: marcar como deleted
  UPDATE profiles 
  SET 
    status = 'deleted',
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Cancelar todos os investimentos ativos do usuário
  UPDATE user_investments 
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE user_id = target_user_id AND status = 'active';

  -- Registrar log da ação
  INSERT INTO admin_action_logs (
    admin_user_id,
    target_user_id,
    action_type,
    details,
    reason
  ) VALUES (
    admin_user_id,
    target_user_id,
    'delete',
    json_build_object(
      'user_email', user_email,
      'soft_delete', true
    ),
    reason
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Usuário deletado com sucesso',
    'user_email', user_email
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;