// Script para testar diretamente a Edge Function digitopay-withdrawal
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDigitoPayWithdrawal() {
  try {
    console.log('🧪 Testando Edge Function digitopay-withdrawal...');
    
    // Dados de teste que simulam um saque real
    const testData = {
      withdrawalId: 'test-withdrawal-123',
      amount: 50.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'EMAIL',
      holderName: 'Teste Usuario',
      cpf: '12345678901'
    };

    console.log('📋 Dados de teste:', testData);

    // Chamar a Edge Function digitopay-withdrawal
    console.log('🚀 Chamando Edge Function digitopay-withdrawal...');
    const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('digitopay-withdrawal', {
      body: testData
    });

    if (paymentError) {
      console.error('❌ Erro na Edge Function:', paymentError);
      console.error('Detalhes do erro:', JSON.stringify(paymentError, null, 2));
      
      // Tentar extrair mais detalhes do erro
      if (paymentError.context && paymentError.context.body) {
        try {
          const errorBody = await paymentError.context.text();
          console.error('Corpo da resposta de erro:', errorBody);
        } catch (e) {
          console.error('Não foi possível ler o corpo da resposta de erro');
        }
      }
    } else {
      console.log('✅ Edge Function executada com sucesso:', paymentResult);
    }

    // Verificar logs de debug
    console.log('📋 Verificando logs de debug...');
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (debugError) {
      console.error('❌ Erro ao buscar logs de debug:', debugError);
    } else {
      console.log('📋 Logs de debug recentes:', debugLogs);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testDigitoPayWithdrawal();