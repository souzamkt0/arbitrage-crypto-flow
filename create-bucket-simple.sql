-- Script SQL para criar o bucket post-images no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar o bucket post-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images', 
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow public read access on post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files from post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in post-images" ON storage.objects;

-- 3. Criar políticas de RLS para leitura pública
CREATE POLICY "Allow public read access on post-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-images');

-- 4. Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated users to upload to post-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- 5. Permitir que usuários deletem seus próprios arquivos
CREATE POLICY "Allow users to delete own files from post-images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Permitir que usuários atualizem seus próprios arquivos
CREATE POLICY "Allow users to update own files in post-images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Verificar se o bucket foi criado com sucesso
SELECT * FROM storage.buckets WHERE id = 'post-images';