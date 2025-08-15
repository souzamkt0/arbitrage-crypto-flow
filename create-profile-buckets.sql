-- Script para criar buckets de imagens de perfil e capa no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Criar bucket para fotos de capa
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-images',
  'cover-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para profile-images
-- Permitir que usuários façam upload de suas próprias imagens
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários vejam todas as imagens de perfil (público)
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas RLS para cover-images
-- Permitir que usuários façam upload de suas próprias imagens de capa
CREATE POLICY "Users can upload their own cover images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários vejam todas as imagens de capa (público)
CREATE POLICY "Cover images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'cover-images');

-- Permitir que usuários deletem suas próprias imagens de capa
CREATE POLICY "Users can delete their own cover images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários atualizem suas próprias imagens de capa
CREATE POLICY "Users can update their own cover images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'cover-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar colunas para URLs das imagens no perfil do usuário (se não existirem)
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Comentário: Execute este script no SQL Editor do Supabase Dashboard
-- para configurar os buckets de upload de imagens de perfil e capa.