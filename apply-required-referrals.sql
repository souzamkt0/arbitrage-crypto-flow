-- Script para aplicar required_referrals manualmente
-- Execute este SQL no Dashboard do Supabase > SQL Editor

-- 1. Adicionar coluna required_referrals se não existir
ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS required_referrals INTEGER DEFAULT 0 NOT NULL;

-- 2. Atualizar valores dos planos existentes
-- Robô 4.0.0 = 0 referrals
UPDATE public.investment_plans 
SET required_referrals = 0 
WHERE name ILIKE '%4.0.0%' OR name ILIKE '%4.0%';

-- Robô 4.0.5 = 10 referrals
UPDATE public.investment_plans 
SET required_referrals = 10 
WHERE name ILIKE '%4.0.5%';

-- Robô 4.1.0 = 20 referrals
UPDATE public.investment_plans 
SET required_referrals = 20 
WHERE name ILIKE '%4.1.0%';

-- 3. Verificar resultado
SELECT name, required_referrals, status 
FROM public.investment_plans 
ORDER BY name;