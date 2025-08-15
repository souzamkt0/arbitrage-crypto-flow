-- Criar buckets para fotos de perfil e capa dos usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'cover-images',
    'cover-images', 
    true,
    10485760, -- 10MB limit para fotos de capa
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- Políticas para fotos de perfil
-- Permitir que usuários façam upload de suas próprias fotos de perfil
CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários vejam suas próprias fotos de perfil
CREATE POLICY "Users can view own profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir visualização pública de fotos de perfil
CREATE POLICY "Public can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Permitir que usuários deletem suas próprias fotos de perfil
CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários atualizem suas próprias fotos de perfil
CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas para fotos de capa
-- Permitir que usuários façam upload de suas próprias fotos de capa
CREATE POLICY "Users can upload own cover images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cover-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários vejam suas próprias fotos de capa
CREATE POLICY "Users can view own cover images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cover-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir visualização pública de fotos de capa
CREATE POLICY "Public can view cover images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cover-images');

-- Permitir que usuários deletem suas próprias fotos de capa
CREATE POLICY "Users can delete own cover images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cover-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários atualizem suas próprias fotos de capa
CREATE POLICY "Users can update own cover images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cover-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Adicionar colunas para URLs das imagens na tabela de usuários (se não existirem)
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Comentários para documentação
COMMENT ON POLICY "Users can upload own profile images" ON storage.objects IS 'Permite que usuários façam upload de suas próprias fotos de perfil';
COMMENT ON POLICY "Public can view profile images" ON storage.objects IS 'Permite visualização pública de fotos de perfil';
COMMENT ON POLICY "Users can delete own profile images" ON storage.objects IS 'Permite que usuários deletem suas próprias fotos de perfil';

COMMENT ON POLICY "Users can upload own cover images" ON storage.objects IS 'Permite que usuários façam upload de suas próprias fotos de capa';
COMMENT ON POLICY "Public can view cover images" ON storage.objects IS 'Permite visualização pública de fotos de capa';
COMMENT ON POLICY "Users can delete own cover images" ON storage.objects IS 'Permite que usuários deletem suas próprias fotos de capa';

COMMENT ON COLUMN auth.users.profile_image_url IS 'URL da foto de perfil do usuário';
COMMENT ON COLUMN auth.users.cover_image_url IS 'URL da foto de capa do usuário';