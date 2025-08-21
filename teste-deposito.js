const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTMxMDksImV4cCI6MjA3MTM2OTEwOX0.YOUR_KEY_HERE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarDeposito() {
  console.log('🧪 INICIANDO TESTE DE DEPÓSITO AUTOMÁTICO');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar se a tabela digitopay_transactions existe
    console.log('1️⃣ Verificando tabela digitopay_transactions...');
    const { data: transactions, error: tableError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela digitopay_transactions:', tableError.message);
      console.log('💡 A tabela pode não existir ou não estar configurada corretamente');
      return;
    }

    console.log('✅ Tabela digitopay_transactions acessível');

    // 2. Criar um depósito de teste
    console.log('\n2️⃣ Criando depósito de teste...');
    const testDeposit = {
      user_id: 'test-user-' + Date.now(),
      trx_id: 'TEST-TRX-' + Date.now(),
      type: 'deposit',
      amount: 10.00,
      amount_brl: 58.50,
      status: 'pending',
      person_name: 'Usuário Teste',
      person_cpf: '12345678901',
      gateway_response: {
        test: true,
        created_at: new Date().toISOString()
      }
    };

    const { data: newDeposit, error: insertError } = await supabase
      .from('digitopay_transactions')
      .insert(testDeposit)
      .select();

    if (insertError) {
      console.log('❌ Erro ao criar depósito de teste:', insertError.message);
      return;
    }

    console.log('✅ Depósito de teste criado:', newDeposit[0].trx_id);

    // 3. Simular webhook de pagamento
    console.log('\n3️⃣ Simulando webhook de pagamento...');
    
    // Simular dados do webhook do DigitoPay
    const webhookData = {
      id: testDeposit.trx_id,
      status: 'PAID',
      value: testDeposit.amount_brl,
      person: {
        cpf: testDeposit.person_cpf,
        name: testDeposit.person_name
      },
      created_at: new Date().toISOString()
    };

    console.log('📤 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // 4. Atualizar status para 'completed'
    console.log('\n4️⃣ Atualizando status para completed...');
    const { data: updatedDeposit, error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString(),
        gateway_response: webhookData
      })
      .eq('trx_id', testDeposit.trx_id)
      .select();

    if (updateError) {
      console.log('❌ Erro ao atualizar status:', updateError.message);
      return;
    }

    console.log('✅ Status atualizado para completed');

    // 5. Verificar se o depósito foi processado
    console.log('\n5️⃣ Verificando processamento do depósito...');
    const { data: finalDeposit, error: finalError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testDeposit.trx_id)
      .single();

    if (finalError) {
      console.log('❌ Erro ao verificar depósito final:', finalError.message);
      return;
    }

    console.log('📊 Status final do depósito:', finalDeposit.status);
    console.log('💰 Valor:', `$${finalDeposit.amount} USD / R$ ${finalDeposit.amount_brl} BRL`);

    // 6. Verificar se existe lógica de ativação automática
    console.log('\n6️⃣ Verificando lógica de ativação automática...');
    
    // Verificar se existe uma função ou trigger no banco
    const { data: functions, error: funcError } = await supabase
      .rpc('get_functions')
      .select();

    if (funcError) {
      console.log('ℹ️ Não foi possível verificar funções do banco (normal em ambiente local)');
    } else {
      console.log('📋 Funções disponíveis:', functions);
    }

    // 7. Verificar tabela de perfis para ver se o saldo seria atualizado
    console.log('\n7️⃣ Verificando estrutura da tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, balance, total_profit')
      .limit(1);

    if (profilesError) {
      console.log('❌ Erro ao acessar tabela profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles acessível');
      console.log('📋 Colunas disponíveis: user_id, balance, total_profit');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 TESTE DE DEPÓSITO CONCLUÍDO!');
    console.log('\n📋 RESUMO:');
    console.log('✅ Depósito de teste criado com sucesso');
    console.log('✅ Status atualizado para completed');
    console.log('✅ Estrutura do banco verificada');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se existe uma função/trigger para atualizar saldo automaticamente');
    console.log('2. Implementar lógica de ativação automática se necessário');
    console.log('3. Testar com usuário real autenticado');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste
testarDeposito();
