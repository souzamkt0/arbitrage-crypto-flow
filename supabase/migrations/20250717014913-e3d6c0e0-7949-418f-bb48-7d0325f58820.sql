-- Remover a função que causou erro e apenas preparar o sistema
DROP FUNCTION IF EXISTS public.setup_admin_user();

-- Verificar se os triggers estão funcionando corretamente
-- O usuário admin será criado automaticamente quando se registrar na interface

-- Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();