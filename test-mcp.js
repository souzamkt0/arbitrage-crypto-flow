import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMCPConnection() {
  try {
    console.log('🔗 Testando conexão MCP com Supabase...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão MCP estabelecida com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

testMCPConnection();
