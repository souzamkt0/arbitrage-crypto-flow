-- Adicionar campo profile_completed na tabela profiles
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Adicionar campo profile_completed se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'profile_completed') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN profile_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Adicionar campos adicionais se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'cpf') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN cpf TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'whatsapp') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN whatsapp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referral_code') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN referral_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'referred_by') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN referred_by TEXT;
    END IF;
END $$;

-- 3. Atualizar perfis existentes para marcar como não completos
UPDATE public.profiles 
SET profile_completed = false 
WHERE profile_completed IS NULL;

-- 4. Verificar se os campos foram adicionados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('profile_completed', 'first_name', 'last_name', 'cpf', 'whatsapp', 'referral_code', 'referred_by')
ORDER BY column_name;

