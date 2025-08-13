// Script para testar a Edge Function digitopay-withdrawal com dados reais
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithRealData() {
  try {
    console.log('🧪 Testando Edge Function digitopay-withdrawal com dados reais...');
    
    // 1. Primeiro, criar um withdrawal de teste
    console.log('📝 Criando withdrawal de teste...');
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        amount_usd: 50.00,
        amount_brl: 250.00,
        type: 'pix',
        status: 'approved', // Aprovado para processamento
        holder_name: 'Teste Usuario',
        cpf: '12345678901',
        pix_key_type: 'EMAIL',
        pix_key: 'teste@email.com',
        fee: 5.00,
        net_amount: 245.00,
        exchange_rate: 5.0
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('❌ Erro ao criar withdrawal:', withdrawalError);
      return;
    }

    console.log('✅ Withdrawal criado:', withdrawal);

    // 2. Agora testar a Edge Function com o ID real
    const testData = {
      withdrawalId: withdrawal.id,
      amount: withdrawal.amount_brl,
      pixKey: withdrawal.pix_key,
      pixKeyType: withdrawal.pix_key_type,
      holderName: withdrawal.holder_name,
      cpf: withdrawal.cpf
    };

    console.log('📋 Dados de teste:', testData);

    // 3. Chamar a Edge Function digitopay-withdrawal
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

    // 4. Verificar se o withdrawal foi atualizado
    console.log('🔍 Verificando se o withdrawal foi atualizado...');
    const { data: updatedWithdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawal.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar withdrawal atualizado:', fetchError);
    } else {
      console.log('📋 Withdrawal atualizado:', updatedWithdrawal);
    }

    // 5. Verificar logs de debug
    console.log('📋 Verificando logs de debug...');
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (debugError) {
      console.error('❌ Erro ao buscar logs de debug:', debugError);
    } else {
      console.log('📋 Logs de debug recentes:', debugLogs);
    }

    // 6. Limpar dados de teste (opcional)
    console.log('🧹 Limpando dados de teste...');
    await supabase
      .from('withdrawals')
      .delete()
      .eq('id', withdrawal.id);
    
    console.log('✅ Teste concluído!');

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testWithRealData();