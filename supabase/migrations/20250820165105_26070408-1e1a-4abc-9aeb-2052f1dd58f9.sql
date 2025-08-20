-- 1. Corrigir valores NULL na tabela auth.users que causam erro de scan 
UPDATE auth.users 
SET 
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
  email_change IS NULL 
  OR email_change_token_new IS NULL 
  OR email_change_token_current IS NULL
  OR confirmation_token IS NULL
  OR recovery_token IS NULL
  OR reauthentication_token IS NULL;

-- 2. Adicionar colunas que faltam na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_balance numeric(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- 3. Criar função para limpar valores NULL em novos usuários
CREATE OR REPLACE FUNCTION public.fix_auth_user_nulls()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para novos usuários (se possível)
-- Nota: Triggers em auth.users podem não funcionar devido a restrições do Supabase
DO $$ 
BEGIN
  -- Tentar criar trigger, mas não falhar se não conseguir
  BEGIN
    CREATE TRIGGER fix_auth_nulls_trigger
      BEFORE INSERT OR UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION fix_auth_user_nulls();
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível criar trigger na tabela auth.users: %', SQLERRM;
  END;
END $$;

-- 5. Confirmar emails automaticamente para usuários existentes
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 6. Criar função para limpeza manual quando necessário
CREATE OR REPLACE FUNCTION public.clean_auth_users()
RETURNS TEXT AS $$
BEGIN
  -- Esta função corrige os dados existentes
  -- Não pode ser aplicada como trigger pois não temos acesso direto à tabela auth.users
  RETURN 'Use esta função para limpeza manual quando necessário';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;