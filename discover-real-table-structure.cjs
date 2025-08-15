const fetch = globalThis.fetch;

const SUPABASE_URL = 'https://wnpkmkqtqnqhqjqzqjqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGtta3F0cW5xaHFqcXpxanF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2ODI5NzMsImV4cCI6MjAzNzI1ODk3M30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function discoverTableStructure() {
  try {
    console.log('🔍 Descobrindo estrutura real da tabela user_investments...');
    
    // Primeiro, tentar uma consulta simples para ver se a tabela existe
    console.log('\n📋 Verificando se a tabela existe...');
    let response = await fetch(`${SUPABASE_URL}/rest/v1/user_investments?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Tabela não existe ou erro de acesso:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Tabela existe!');
    console.log('📊 Registros encontrados:', data.length);
    
    if (data.length > 0) {
      console.log('🔍 Estrutura descoberta através de dados existentes:');
      console.log('📝 Colunas:', Object.keys(data[0]));
      return;
    }

    // Se não há dados, tentar inserir um registro mínimo
    console.log('\n🧪 Tabela vazia. Testando inserção com campos mínimos...');
    
    const minimalData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      amount: 100.00
    };

    response = await fetch(`${SUPABASE_URL}/rest/v1/user_investments`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(minimalData)
    });

    if (response.ok) {
      const insertData = await response.json();
      console.log('✅ Inserção mínima bem-sucedida!');
      console.log('📊 Estrutura descoberta:', Object.keys(insertData[0]));
      
      // Limpar registro de teste
      if (insertData[0] && insertData[0].id) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_investments?id=eq.${insertData[0].id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        console.log('🧹 Registro de teste removido');
      }
      return;
    }

    // Se falhou, analisar o erro
    const errorText = await response.text();
    console.log('❌ Erro na inserção:', errorText);
    
    // Tentar descobrir campos obrigatórios através do erro
    if (errorText.includes('null value in column')) {
      const match = errorText.match(/null value in column "([^"]+)"/g);
      if (match) {
        console.log('🔍 Campos obrigatórios identificados:', match);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

discoverTableStructure();