import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCommunityConnection() {
  console.log('🔍 Testando conexão com community_posts...');
  console.log('📡 URL:', SUPABASE_URL);
  console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  try {
    // Teste 1: Verificar se a tabela existe
    console.log('\n📋 Teste 1: Verificando estrutura da tabela...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ Erro na estrutura da tabela:', tableError);
      return;
    }
    console.log('✅ Tabela community_posts acessível');
    
    // Teste 2: Buscar dados com timeout
    console.log('\n📊 Teste 2: Buscando dados com timeout...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const { data, error, status, statusText } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      console.log('📈 Status:', status);
      console.log('📝 Status Text:', statusText);
      
      if (error) {
        console.error('❌ Erro na consulta:', error);
        console.error('🔍 Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }
      
      console.log('✅ Dados carregados com sucesso!');
      console.log('📊 Registros encontrados:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📄 Primeiro registro:', {
          id: data[0].id,
          content: data[0].content?.substring(0, 50) + '...',
          created_at: data[0].created_at
        });
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Timeout: Conexão demorou mais de 10 segundos');
      } else {
        console.error('❌ Erro de fetch:', fetchError);
      }
    }
    
    // Teste 3: Verificar conectividade geral
    console.log('\n🌐 Teste 3: Verificando conectividade geral...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('community_posts')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro de conectividade:', healthError);
    } else {
      console.log('✅ Conectividade OK');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// Executar teste
testCommunityConnection()
  .then(() => {
    console.log('\n🎉 Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });