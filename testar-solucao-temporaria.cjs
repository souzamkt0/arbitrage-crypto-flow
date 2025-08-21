const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSolucaoTemporaria() {
  console.log('🧪 Testando solução temporária com userId padrão...\n');

  try {
    // 1. Simular o que acontece no frontend sem autenticação
    console.log('👤 1. Simulando frontend sem autenticação...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('👤 Usuário obtido:', user ? user.id : 'null/undefined');
    
    // 2. Simular a lógica do DigitoPayService.createDeposit
    console.log('\n🚀 2. Simulando DigitoPayService.createDeposit...');
    
    const userId = user?.id || '0a9325f4-911d-431b-a8ae-1132b4167711';
    
    console.log('🔍 userId que será usado:', userId);
    
    const testData = {
      amount: 10,
      cpf: '12345678909',
      name: 'Teste Usuário',
      callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
      userId: userId
    };

    console.log('📋 Dados de teste:', testData);

    // 3. Chamar Edge Function
    console.log('\n📡 3. Chamando Edge Function...');
    
    const { data: result, error: invokeError } = await supabase.functions.invoke('digitopay-deposit', {
      body: testData
    });

    if (invokeError) {
      console.error('❌ Erro na chamada da Edge Function:', invokeError);
      console.error('📝 Detalhes do erro:', JSON.stringify(invokeError, null, 2));
    } else {
      console.log('✅ Edge Function executada com sucesso!');
      console.log('📝 Resultado:', result);
      
      // 4. Verificar se a transação foi salva
      console.log('\n📋 4. Verificando se transação foi salva...');
      
      const { data: transaction, error: transactionError } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('trx_id', result.id)
        .single();

      if (transactionError) {
        console.error('❌ Erro ao buscar transação:', transactionError);
      } else {
        console.log('✅ Transação salva na tabela!');
        console.log('💰 Valor: R$', transaction.amount_brl);
        console.log('📊 Status:', transaction.status);
        console.log('👤 User ID:', transaction.user_id);
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarSolucaoTemporaria();
