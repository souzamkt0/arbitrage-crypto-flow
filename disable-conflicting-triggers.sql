-- Desabilitar triggers conflitantes
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS trigger_create_facebook_profile ON auth.users;

-- Verificar se foram removidos
SELECT 
  'Triggers restantes' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('profiles', 'users')
ORDER BY trigger_name;

