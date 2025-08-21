const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createExecSqlFunction() {
  console.log('🔧 Criando função exec_sql...');
  
  const createFunctionSQL = `
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
  `;
  
  try {
    // Tentar executar diretamente via SQL
    const { data, error } = await supabase
      .from('pg_stat_user_functions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao testar conexão:', error);
      return;
    }
    
    console.log('✅ Conexão estabelecida');
    
    // Como não podemos executar DDL diretamente via REST API,
    // vamos tentar usar uma abordagem alternativa
    console.log('⚠️ Função exec_sql precisa ser criada diretamente no banco via SQL Editor do Supabase');
    console.log('📋 SQL para executar no Supabase SQL Editor:');
    console.log('\n' + createFunctionSQL);
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

createExecSqlFunction();