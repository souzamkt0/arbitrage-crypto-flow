-- Criar chave estrangeira correta para investment_plan_id
ALTER TABLE public.user_investments 
ADD CONSTRAINT user_investments_investment_plan_id_fkey 
FOREIGN KEY (investment_plan_id) REFERENCES public.investment_plans(id) 
ON DELETE CASCADE;