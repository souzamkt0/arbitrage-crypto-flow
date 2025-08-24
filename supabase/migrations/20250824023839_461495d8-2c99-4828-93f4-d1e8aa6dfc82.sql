-- Criar tabela para histórico de alterações de planos
CREATE TABLE IF NOT EXISTS public.plan_rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES investment_plans(id) ON DELETE CASCADE,
  old_daily_rate NUMERIC NOT NULL,
  new_daily_rate NUMERIC NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(user_id),
  reason TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar RLS na tabela de histórico
ALTER TABLE public.plan_rate_history ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem histórico
CREATE POLICY "Admins can view plan rate history" 
ON public.plan_rate_history 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Política para admins inserirem histórico
CREATE POLICY "Admins can insert plan rate history" 
ON public.plan_rate_history 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));