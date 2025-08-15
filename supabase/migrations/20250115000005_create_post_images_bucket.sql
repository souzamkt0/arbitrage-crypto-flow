-- Criar bucket post-images para upload de imagens dos posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Criar políticas de RLS para o bucket post-images
-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow public read access on post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files from post-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in post-images" ON storage.objects;

-- Criar novas políticas
CREATE POLICY "Allow public read access on post-images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated users to upload to post-images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete own files from post-images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update own files in post-images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);