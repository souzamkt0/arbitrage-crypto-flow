-- Criar tabela para uploads de fotos
CREATE TABLE IF NOT EXISTS photo_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_photo_uploads_user_id ON photo_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_is_active ON photo_uploads(is_active);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_file_type ON photo_uploads(file_type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE photo_uploads ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios uploads
CREATE POLICY "Users can view own photo uploads" ON photo_uploads
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios uploads
CREATE POLICY "Users can insert own photo uploads" ON photo_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios uploads
CREATE POLICY "Users can update own photo uploads" ON photo_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios uploads
CREATE POLICY "Users can delete own photo uploads" ON photo_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_photo_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_photo_uploads_updated_at_trigger
  BEFORE UPDATE ON photo_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_uploads_updated_at();

-- Comentários para documentação
COMMENT ON TABLE photo_uploads IS 'Tabela para armazenar informações sobre uploads de fotos dos usuários';
COMMENT ON COLUMN photo_uploads.id IS 'ID único do upload';
COMMENT ON COLUMN photo_uploads.user_id IS 'ID do usuário que fez o upload';
COMMENT ON COLUMN photo_uploads.file_name IS 'Nome original do arquivo';
COMMENT ON COLUMN photo_uploads.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN photo_uploads.file_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN photo_uploads.file_url IS 'URL pública do arquivo';
COMMENT ON COLUMN photo_uploads.storage_path IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN photo_uploads.upload_date IS 'Data e hora do upload';
COMMENT ON COLUMN photo_uploads.is_active IS 'Indica se o arquivo está ativo';
COMMENT ON COLUMN photo_uploads.metadata IS 'Metadados adicionais em formato JSON';