// Credenciais do Supabase (do arquivo .env)
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas');
  process.exit(1);
}

async function testSupabaseColumns() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica usando fetch
    const response = await fetch(`${supabaseUrl}/rest/v1/user_investments?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const testData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro ao conectar com Supabase:', testData.message || response.statusText);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    
    // Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela user_investments...');
    
    if (testData && testData.length > 0) {
      const columns = Object.keys(testData[0]);
      console.log('Colunas encontradas:', columns);
      
      const requiredColumns = ['daily_target', 'days_remaining', 'total_operations'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('\n❌ Colunas ausentes:', missingColumns);
        console.log('\n📝 Para resolver, execute a migração SQL no Supabase:');
        console.log('1. Acesse o SQL Editor do Supabase');
        console.log('2. Cole o conteúdo do arquivo: supabase/migrations/20250115000000_add_missing_columns_user_investments.sql');
        console.log('3. Execute a query');
      } else {
        console.log('\n✅ Todas as colunas necessárias estão presentes');
      }
    } else {
      console.log('\n⚠️  Tabela user_investments está vazia. Testando inserção...');
      
      // Testar inserção com as colunas necessárias
      const testInsert = {
        user_id: '00000000-0000-0000-0000-000000000000', // UUID fictício
        investment_plan_id: '00000000-0000-0000-0000-000000000000',
        amount: 100,
        daily_rate: 0.02,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        days_remaining: 30,
        daily_target: 2.00,
        total_operations: 15
      };
      
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/user_investments`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testInsert)
      });
      
      const insertResult = await insertResponse.json();
      
      if (!insertResponse.ok) {
        console.log('❌ Erro ao testar inserção:', insertResult.message);
        if (insertResult.message && insertResult.message.includes('column') && insertResult.message.includes('does not exist')) {
          console.log('\n🔧 Problema: Colunas ausentes na tabela');
          console.log('📝 Solução: Execute a migração SQL no Supabase');
        }
      } else {
        console.log('✅ Teste de inserção bem-sucedido (removendo registro de teste...)');
        // Remover o registro de teste
        await fetch(`${supabaseUrl}/rest/v1/user_investments?user_id=eq.00000000-0000-0000-0000-000000000000`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

testSupabaseColumns();