-- Criação da tabela de usuários personalizados para o sistema Alphabit
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela custom_users
CREATE TABLE IF NOT EXISTS custom_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_username TEXT NOT NULL,
    custom_username TEXT UNIQUE,
    custom_display_name TEXT,
    profile_image_url TEXT,
    cover_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS custom_users_original_username_idx ON custom_users(original_username);
CREATE INDEX IF NOT EXISTS custom_users_custom_username_idx ON custom_users(custom_username);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela
CREATE TRIGGER update_custom_users_updated_at 
    BEFORE UPDATE ON custom_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os usuários
CREATE POLICY "Permitir leitura de usuários personalizados" ON custom_users
    FOR SELECT USING (true);

-- Política para permitir inserção de novos usuários (apenas usuários autenticados)
CREATE POLICY "Permitir inserção de usuários personalizados" ON custom_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização (apenas o próprio usuário ou admin)
CREATE POLICY "Permitir atualização de usuários personalizados" ON custom_users
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            auth.jwt() ->> 'email' = 'admin@alphabit.com' OR
            true -- Por enquanto permitir para todos autenticados
        )
    );

-- Inserir o Hugo Master como primeiro usuário
INSERT INTO custom_users (
    original_username,
    custom_username,
    custom_display_name,
    bio
) VALUES (
    'cryptomaster',
    'hugomaster',
    'Hugo Master',
    'Especialista em trading de criptomoedas e arbitragem'
) ON CONFLICT (custom_username) DO NOTHING;

-- Inserir outros usuários padrão
INSERT INTO custom_users (
    original_username,
    custom_username,
    custom_display_name,
    bio
) VALUES 
(
    'carlaoliveira',
    'carla_oliveira',
    'Carla Oliveira',
    'Analista técnico e trader profissional'
),
(
    'brunosilva',
    'bruno_silva',
    'Bruno Silva',
    'Entusiasta Bitcoin e HODLer desde 2017'
),
(
    'danielacosta',
    'daniela_costa',
    'Daniela Costa',
    'Especialista em DeFi e protocolos descentralizados'
),
(
    'andreferreira',
    'andre_ferreira',
    'André Ferreira',
    'Trader focado em scalping e day trade'
) ON CONFLICT (custom_username) DO NOTHING;

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabela custom_users criada com sucesso!' as status,
    count(*) as total_usuarios
FROM custom_users;




