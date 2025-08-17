-- Função RPC para atualizar role do usuário
-- Esta função permite atualizar o role de um usuário de forma segura

CREATE OR REPLACE FUNCTION update_user_role(
  user_id_param UUID,
  new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = user_id_param) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Atualizar o role
  UPDATE profiles 
  SET role = new_role
  WHERE user_id = user_id_param;
  
  -- Retornar true se a atualização foi bem-sucedida
  RETURN FOUND;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION update_user_role IS 'Função para atualizar o role de um usuário de forma segura';

-- Permitir que admins usem a função
GRANT EXECUTE ON FUNCTION update_user_role TO authenticated;
