const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarErroSalvamento() {
  console.log('🔍 Verificando erro de salvamento...\n');

  try {
    // 1. Verificar logs de erro de salvamento
    console.log('❌ 1. Logs de erro ao salvar transação...');
    
    const { data: errorLogs, error: errorLogsError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .eq('tipo', 'save_transaction_error')
      .order('created_at', { ascending: false })
      .limit(5);

    if (errorLogsError) {
      console.error('❌ Erro ao verificar logs de erro:', errorLogsError);
    } else {
      console.log(`✅ Logs de erro encontrados: ${errorLogs?.length || 0}`);
      if (errorLogs && errorLogs.length > 0) {
        errorLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.created_at}`);
          console.log(`     Erro: ${JSON.stringify(log.payload?.error, null, 2)}`);
        });
      } else {
        console.log('❌ NENHUM LOG DE ERRO ENCONTRADO!');
      }
    }

    // 2. Verificar logs de sucesso de salvamento
    console.log('\n✅ 2. Logs de sucesso ao salvar transação...');
    
    const { data: successLogs, error: successLogsError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .eq('tipo', 'save_transaction_success')
      .order('created_at', { ascending: false })
      .limit(5);

    if (successLogsError) {
      console.error('❌ Erro ao verificar logs de sucesso:', successLogsError);
    } else {
      console.log(`✅ Logs de sucesso encontrados: ${successLogs?.length || 0}`);
      if (successLogs && successLogs.length > 0) {
        successLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.created_at}`);
          console.log(`     Dados: ${JSON.stringify(log.payload, null, 2)}`);
        });
      } else {
        console.log('❌ NENHUM LOG DE SUCESSO ENCONTRADO!');
      }
    }

    // 3. Verificar estrutura da tabela
    console.log('\n📊 3. Verificando estrutura da tabela...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
    } else {
      console.log('✅ Tabela acessível');
      if (tableInfo && tableInfo.length > 0) {
        console.log('📝 Estrutura da primeira linha:', Object.keys(tableInfo[0]));
      }
    }

    // 4. Tentar inserir uma transação de teste
    console.log('\n🧪 4. Testando inserção de transação...');
    
    const testTransaction = {
      user_id: '00000000-0000-0000-0000-000000000000',
      trx_id: 'TEST-TRX-' + Date.now(),
      type: 'deposit',
      amount: 5.85,
      amount_brl: 5.85,
      status: 'pending',
      pix_code: 'test-pix-code',
      qr_code_base64: 'test-qr-code',
      person_name: 'Test User',
      person_cpf: '12345678909',
      gateway_response: { test: true }
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('digitopay_transactions')
      .insert(testTransaction)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir transação de teste:', insertError);
      
      // Log do erro
      await supabase
        .from('digitopay_debug')
        .insert({
          tipo: 'test_insert_error',
          payload: {
            error: insertError,
            testData: testTransaction
          }
        });
    } else {
      console.log('✅ Transação de teste inserida com sucesso:', insertResult);
      
      // Log do sucesso
      await supabase
        .from('digitopay_debug')
        .insert({
          tipo: 'test_insert_success',
          payload: {
            result: insertResult,
            testData: testTransaction
          }
        });
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarErroSalvamento();
