-- Script para criar buckets de upload de imagens no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar bucket para fotos de capa
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-images',
  'cover-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS para profile-images
-- Permitir upload das próprias imagens
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir visualização pública
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Permitir deletar próprias imagens
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualizar próprias imagens
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Políticas RLS para cover-images
-- Permitir upload das próprias imagens de capa
CREATE POLICY "Users can upload their own cover images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir visualização pública
CREATE POLICY "Cover images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'cover-images');

-- Permitir deletar próprias imagens de capa
CREATE POLICY "Users can delete their own cover images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualizar próprias imagens de capa
CREATE POLICY "Users can update their own cover images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Verificar se os buckets foram criados
SELECT 
  'Buckets criados com sucesso!' as status,
  count(*) as total_buckets
FROM storage.buckets 
WHERE id IN ('profile-images', 'cover-images');
