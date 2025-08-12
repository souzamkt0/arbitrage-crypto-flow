-- Garantir que não há foreign key problemática entre profiles e auth.users
-- Vamos temporariamente remover essa constraint também
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Recriar constraint apenas para validação futura, não para dados existentes  
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Não validar agora para permitir dados existentes
-- ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_user_id_fkey;

-- Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();