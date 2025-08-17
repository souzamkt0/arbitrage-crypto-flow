-- Script para verificar se os buckets de upload existem no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar buckets existentes
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id IN ('profile-images', 'cover-images')
ORDER BY name;

-- Se nenhum resultado for retornado, os buckets não existem e precisam ser criados
