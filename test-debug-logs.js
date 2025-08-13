// Script para testar se os logs de debug estão sendo salvos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDebugLogs() {
  try {
    console.log('🧪 Testando logs de debug...');
    
    // 1. Verificar se a tabela digitopay_debug existe
    console.log('🔍 Verificando estrutura da tabela digitopay_debug...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela digitopay_debug:', tableError);
      return;
    }

    console.log('✅ Tabela digitopay_debug acessível');

    // 2. Tentar inserir um log de teste
    console.log('📝 Inserindo log de teste...');
    const { data: insertData, error: insertError } = await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'test_log',
        payload: {
          message: 'Teste de log de debug',
          timestamp: new Date().toISOString()
        }
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir log de teste:', insertError);
    } else {
      console.log('✅ Log de teste inserido com sucesso:', insertData);
    }

    // 3. Buscar logs recentes
    console.log('🔍 Buscando logs recentes...');
    const { data: recentLogs, error: fetchError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('❌ Erro ao buscar logs:', fetchError);
    } else {
      console.log('📋 Logs recentes encontrados:', recentLogs?.length || 0);
      if (recentLogs && recentLogs.length > 0) {
        console.log('📋 Últimos logs:');
        recentLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. [${log.created_at}] ${log.tipo}:`, log.payload);
        });
      }
    }

    // 4. Chamar a Edge Function e verificar se o log foi criado
    console.log('🚀 Chamando Edge Function para gerar log...');
    const testData = {
      withdrawalId: 'debug-test-' + Date.now(),
      amount: 50.00,
      pixKey: 'debug@test.com',
      pixKeyType: 'EMAIL',
      holderName: 'Debug Test',
      cpf: '11111111111'
    };

    const response = await fetch(`${supabaseUrl}/functions/v1/digitopay-withdrawal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status da Edge Function:', response.status);
    const responseText = await response.text();
    console.log('📋 Resposta da Edge Function:', responseText);

    // 5. Aguardar um pouco e verificar novamente os logs
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Verificando logs após chamada da Edge Function...');
    const { data: afterLogs, error: afterError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (afterError) {
      console.error('❌ Erro ao buscar logs após Edge Function:', afterError);
    } else {
      console.log('📋 Logs após Edge Function:', afterLogs?.length || 0);
      if (afterLogs && afterLogs.length > 0) {
        console.log('📋 Logs mais recentes:');
        afterLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. [${log.created_at}] ${log.tipo}:`, log.payload);
        });
      }
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testDebugLogs();