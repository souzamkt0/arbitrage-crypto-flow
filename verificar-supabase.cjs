const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarSupabase() {
  console.log('🔍 Verificando Supabase...\n');

  try {
    // 1. Verificar se as tabelas existem
    console.log('📊 1. Verificando tabelas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['digitopay_transactions', 'digitopay_debug', 'deposits']);

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('✅ Tabelas encontradas:', tables?.map(t => t.table_name) || []);
    }

    // 2. Verificar logs de debug
    console.log('\n📋 2. Verificando logs de debug...');
    
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (debugError) {
      console.error('❌ Erro ao verificar logs de debug:', debugError);
    } else {
      console.log(`✅ Logs de debug encontrados: ${debugLogs?.length || 0}`);
      if (debugLogs && debugLogs.length > 0) {
        console.log('📝 Últimos logs:');
        debugLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.tipo} - ${log.created_at}`);
        });
      }
    }

    // 3. Verificar transações
    console.log('\n💳 3. Verificando transações...');
    
    const { data: transactions, error: transError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (transError) {
      console.error('❌ Erro ao verificar transações:', transError);
    } else {
      console.log(`✅ Transações encontradas: ${transactions?.length || 0}`);
      if (transactions && transactions.length > 0) {
        console.log('📝 Últimas transações:');
        transactions.forEach((tx, index) => {
          console.log(`  ${index + 1}. ${tx.trx_id} - ${tx.status} - R$ ${tx.amount_brl}`);
        });
      }
    }

    // 4. Verificar depósitos
    console.log('\n💰 4. Verificando depósitos...');
    
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (depositsError) {
      console.error('❌ Erro ao verificar depósitos:', depositsError);
    } else {
      console.log(`✅ Depósitos encontrados: ${deposits?.length || 0}`);
      if (deposits && deposits.length > 0) {
        console.log('📝 Últimos depósitos:');
        deposits.forEach((dep, index) => {
          console.log(`  ${index + 1}. R$ ${dep.amount_brl} - ${dep.status} - ${dep.created_at}`);
        });
      }
    }

    // 5. Verificar Edge Functions
    console.log('\n⚡ 5. Testando Edge Functions...');
    
    try {
      const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ trxId: 'TEST-TRX-123' })
      });
      
      const result = await response.json();
      console.log('✅ Edge Function digitopay-status:', response.status);
      console.log('📝 Resposta:', result);
    } catch (edgeError) {
      console.error('❌ Erro na Edge Function:', edgeError.message);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarSupabase();
