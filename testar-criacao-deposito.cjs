const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCriacaoDeposito() {
  console.log('🧪 Testando criação de depósito...\n');

  try {
    // 1. Testar Edge Function diretamente
    console.log('⚡ 1. Testando Edge Function digitopay-deposit...');
    
    const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        amount: 5.85,
        cpf: '12345678909',
        name: 'Teste Usuário',
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
        userId: '00000000-0000-0000-0000-000000000000'
      })
    });
    
    const result = await response.json();
    console.log('📡 Status da resposta:', response.status);
    console.log('📝 Resultado:', JSON.stringify(result, null, 2));

    // 2. Verificar se a transação foi criada
    if (result.success && result.id) {
      console.log('\n✅ 2. Verificando se transação foi salva...');
      
      const { data: transaction, error: transError } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('trx_id', result.id)
        .single();

      if (transError) {
        console.error('❌ Erro ao buscar transação:', transError);
      } else {
        console.log('✅ Transação encontrada:', transaction);
      }
    }

    // 3. Verificar logs de debug
    console.log('\n📋 3. Verificando logs de debug...');
    
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .eq('tipo', 'createDeposit_via_edge')
      .order('created_at', { ascending: false })
      .limit(1);

    if (debugError) {
      console.error('❌ Erro ao verificar logs:', debugError);
    } else {
      console.log(`✅ Logs de criação: ${debugLogs?.length || 0}`);
      if (debugLogs && debugLogs.length > 0) {
        console.log('📝 Último log:', debugLogs[0]);
      }
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testarCriacaoDeposito();
