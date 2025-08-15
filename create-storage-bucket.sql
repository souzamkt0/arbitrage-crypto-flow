-- Script para criar bucket de storage para fotos no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar bucket para fotos dos usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários façam upload de suas próprias fotos
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir que usuários vejam suas próprias fotos
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir visualização pública de fotos (para posts da comunidade)
CREATE POLICY "Public can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-photos');

-- Política para permitir que usuários deletem suas próprias fotos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Comentários
COMMENT ON POLICY "Users can upload own photos" ON storage.objects IS 'Permite que usuários façam upload de fotos em suas próprias pastas';
COMMENT ON POLICY "Users can view own photos" ON storage.objects IS 'Permite que usuários vejam suas próprias fotos';
COMMENT ON POLICY "Public can view photos" ON storage.objects IS 'Permite visualização pública de fotos para posts da comunidade';
COMMENT ON POLICY "Users can delete own photos" ON storage.objects IS 'Permite que usuários deletem suas próprias fotos';