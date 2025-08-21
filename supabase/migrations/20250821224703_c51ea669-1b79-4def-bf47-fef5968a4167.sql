-- Limpar dados de debug e logs desnecessários
-- Remove registros antigos de debug para manter a base limpa

-- Limpar tabela de debug do DigitoPay (manter apenas últimos 100 registros)
DELETE FROM public.digitopay_debug 
WHERE id NOT IN (
    SELECT id FROM public.digitopay_debug 
    ORDER BY created_at DESC 
    LIMIT 100
);

-- Verificar estrutura final
SELECT 
    'Limpeza concluída!' as status,
    COUNT(*) as registros_debug_restantes
FROM public.digitopay_debug;