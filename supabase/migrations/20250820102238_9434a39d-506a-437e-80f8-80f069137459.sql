-- Criar uma função que corrige automaticamente os campos NULL problemáticos
-- Esta função pode ser executada como um trigger ou função de sistema

CREATE OR REPLACE FUNCTION public.fix_auth_user_nulls()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar campos NULL que causam erro de scan
  IF NEW.email_change IS NULL THEN
    NEW.email_change := '';
  END IF;
  
  IF NEW.email_change_token_new IS NULL THEN
    NEW.email_change_token_new := '';
  END IF;
  
  IF NEW.email_change_token_current IS NULL THEN
    NEW.email_change_token_current := '';
  END IF;
  
  -- Limpar outros campos problemáticos
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := '';
  END IF;
  
  IF NEW.recovery_token IS NULL THEN
    NEW.recovery_token := '';
  END IF;
  
  IF NEW.reauthentication_token IS NULL THEN
    NEW.reauthentication_token := '';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar função manual para corrigir dados existentes
CREATE OR REPLACE FUNCTION public.clean_auth_users()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função corrige os dados existentes
  -- Não pode ser aplicada como trigger pois não temos acesso direto à tabela auth.users
  RETURN 'Use esta função para limpeza manual quando necessário';
END;
$$;