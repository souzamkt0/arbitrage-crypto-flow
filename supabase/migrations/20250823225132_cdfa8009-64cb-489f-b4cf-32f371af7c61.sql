-- Primeiro, vamos ver quais valores são aceitos para o campo 'type' na tabela trading_history
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'trading_history' 
AND n.nspname = 'public'
AND c.contype = 'c';