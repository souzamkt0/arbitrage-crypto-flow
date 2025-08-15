-- Script alternativo para criar tabela de perfis de usuário
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela personalizada para perfis de usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  display_name TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os perfis (público)
CREATE POLICY "Perfis são publicamente visíveis" ON public.user_profiles
FOR SELECT USING (true);

-- Política para permitir que usuários criem seu próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seu próprio perfil
CREATE POLICY "Usuários podem deletar seu próprio perfil" ON public.user_profiles
FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_photo ON public.user_profiles(profile_photo_url);

-- Função para atualizar o timestamp updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentário: Esta solução cria uma tabela separada para perfis de usuário
-- que você tem controle total, evitando problemas de permissão com auth.users