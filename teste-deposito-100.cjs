const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testeDeposito100() {
  console.log('💰 Testando depósito de R$100...\n');

  try {
    // 1. Verificar saldo atual do usuário
    console.log('👤 1. Verificando saldo atual...');
    
    const userId = '0a9325f4-911d-431b-a8ae-1132b4167711'; // esnyce@gmail.com
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance, total_profit, email, username')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }

    console.log(`✅ Saldo atual: R$ ${profile.balance || 0}`);
    console.log(`📊 Lucro total: R$ ${profile.total_profit || 0}`);
    console.log(`👤 Usuário: ${profile.email} (${profile.username})`);

    // 2. Criar depósito de R$100
    console.log('\n💳 2. Criando depósito de R$100...');
    
    const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        amount: 100,
        cpf: '12345678909',
        name: 'Teste Usuário',
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
        userId: userId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Depósito criado com sucesso!');
      console.log(`📱 ID da transação: ${result.id}`);
      console.log(`💳 PIX Code: ${result.pixCopiaECola?.substring(0, 50)}...`);
      
      // 3. Verificar se transação foi salva
      console.log('\n📋 3. Verificando se transação foi salva...');
      
      const { data: transaction, error: transactionError } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('trx_id', result.id)
        .single();

      if (transactionError) {
        console.error('❌ Erro ao buscar transação:', transactionError);
      } else {
        console.log('✅ Transação salva na tabela!');
        console.log(`💰 Valor: R$ ${transaction.amount_brl}`);
        console.log(`📊 Status: ${transaction.status}`);
      }

      // 4. Simular pagamento (ativar automaticamente)
      console.log('\n🎯 4. Simulando pagamento...');
      
      const activateResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/process-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          trxId: result.id,
          userId: userId,
          amount: 100
        })
      });

      const activateResult = await activateResponse.json();
      
      if (activateResult.success) {
        console.log('✅ Pagamento simulado com sucesso!');
        
        // 5. Verificar saldo atualizado
        console.log('\n💰 5. Verificando saldo atualizado...');
        
        const { data: updatedProfile, error: updatedProfileError } = await supabase
          .from('profiles')
          .select('balance, total_profit')
          .eq('user_id', userId)
          .single();

        if (updatedProfileError) {
          console.error('❌ Erro ao buscar perfil atualizado:', updatedProfileError);
        } else {
          console.log(`✅ Saldo atualizado: R$ ${updatedProfile.balance || 0}`);
          console.log(`📊 Lucro total: R$ ${updatedProfile.total_profit || 0}`);
          
          const saldoAnterior = profile.balance || 0;
          const saldoAtual = updatedProfile.balance || 0;
          const diferenca = saldoAtual - saldoAnterior;
          
          console.log(`📈 Diferença: R$ ${diferenca}`);
          
          if (diferenca >= 100) {
            console.log('🎉 SUCESSO! Saldo foi atualizado corretamente!');
          } else {
            console.log('⚠️ ATENÇÃO: Saldo não foi atualizado corretamente');
          }
        }
        
        // 6. Verificar se depósito foi marcado como concluído
        console.log('\n📋 6. Verificando status do depósito...');
        
        const { data: updatedTransaction, error: updatedTransactionError } = await supabase
          .from('digitopay_transactions')
          .select('status')
          .eq('trx_id', result.id)
          .single();

        if (updatedTransactionError) {
          console.error('❌ Erro ao buscar transação atualizada:', updatedTransactionError);
        } else {
          console.log(`📊 Status da transação: ${updatedTransaction.status}`);
          
          if (updatedTransaction.status === 'completed') {
            console.log('✅ Transação marcada como concluída!');
          } else {
            console.log('⚠️ Transação ainda não foi marcada como concluída');
          }
        }
        
      } else {
        console.error('❌ Erro ao simular pagamento:', activateResult);
      }
      
    } else {
      console.error('❌ Erro ao criar depósito:', result);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testeDeposito100();
