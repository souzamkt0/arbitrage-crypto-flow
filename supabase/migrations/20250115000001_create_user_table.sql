-- Criar tabela de exemplo para o usuário
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Criar política de segurança - usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);

-- Comentários da tabela
COMMENT ON TABLE user_data IS 'Tabela para armazenar dados adicionais dos usuários';
COMMENT ON COLUMN user_data.id IS 'ID único da tabela';
COMMENT ON COLUMN user_data.user_id IS 'Referência ao usuário autenticado';
COMMENT ON COLUMN user_data.name IS 'Nome completo do usuário';
COMMENT ON COLUMN user_data.email IS 'Email do usuário';
COMMENT ON COLUMN user_data.phone IS 'Telefone do usuário';
COMMENT ON COLUMN user_data.address IS 'Endereço completo';
COMMENT ON COLUMN user_data.city IS 'Cidade';
COMMENT ON COLUMN user_data.country IS 'País';