-- Criar função exec_sql para executar SQL dinâmico
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- Executar o SQL dinâmico
    EXECUTE sql;
    
    -- Retornar sucesso
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        -- Retornar erro
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

-- Garantir que a função seja acessível via RPC
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;