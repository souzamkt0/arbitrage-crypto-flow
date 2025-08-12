-- Verificar se a tabela investment_plans já existe e se não, criar ela
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'investment_plans') THEN
        -- A tabela já existe no schema, então não fazemos nada
        NULL;
    END IF;
END
$$;

-- Inserir planos padrão se a tabela estiver vazia
INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration_days, description, status)
SELECT * FROM (VALUES 
    ('Robô 4.0', 2.5, 10, 100, 40, 'Robô de alta performance com 2,5% de retorno diário. Ideal para investimentos menores.', 'active')
) AS t(name, daily_rate, minimum_amount, maximum_amount, duration_days, description, status)
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans);