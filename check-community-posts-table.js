import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCommunityPostsTable() {
  console.log('🔍 Verificando se a tabela community_posts existe...');
  
  try {
    // Tentar fazer uma consulta simples na tabela
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar community_posts:', error.message);
      
      if (error.message.includes('relation "public.community_posts" does not exist')) {
        console.log('\n📋 A tabela community_posts NÃO existe!');
        console.log('\n🔧 Soluções possíveis:');
        console.log('1. Criar a tabela community_posts no Supabase');
        console.log('2. Verificar se o nome da tabela está correto no código');
        console.log('3. Executar as migrações do banco de dados');
      }
      
      return false;
    }
    
    console.log('✅ Tabela community_posts existe e está acessível!');
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros');
    
    return true;
    
  } catch (err) {
    console.error('💥 Erro inesperado:', err.message);
    return false;
  }
}

// Verificar também outras tabelas relacionadas
async function checkRelatedTables() {
  const tables = ['profiles', 'social_posts', 'user_profiles'];
  
  console.log('\n🔍 Verificando tabelas relacionadas...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK (${data?.length || 0} registros)`);
      }
    } catch (err) {
      console.log(`💥 ${table}: Erro inesperado - ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando verificação do banco de dados...');
  console.log('🔗 URL:', process.env.VITE_SUPABASE_URL);
  
  await checkCommunityPostsTable();
  await checkRelatedTables();
  
  console.log('\n✨ Verificação concluída!');
}

main().catch(console.error);