// Script para testar a funcionalidade de saque após fix RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithdrawalCreation() {
  try {
    console.log('🧪 Testando criação de saque com novas políticas RLS...');
    
    // Dados de teste
    const testData = {
      user_id: '2441e304-9a11-412c-8d13-b2c9fc701d8f', // ID do usuário souzamkt0
      amount_usd: 50.00,
      amount_brl: 275.00,
      fee: 2.50,
      net_amount: 47.50,
      type: 'pix',
      pix_key: 'teste@email.com',
      pix_key_type: 'EMAIL',
      cpf: '12345678901',
      holder_name: 'Teste Usuario RLS',
      status: 'pending'
    };

    console.log('📋 Dados de teste:', testData);

    // Tentar inserir saque
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Erro ao criar saque:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
    } else {
      console.log('✅ Saque criado com sucesso!');
      console.log('📄 Dados do saque:', data);
      
      // Verificar se o saque foi criado na tabela
      const { data: verification, error: verifyError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', data[0].id);
        
      if (verifyError) {
        console.error('❌ Erro ao verificar saque:', verifyError);
      } else {
        console.log('✅ Verificação: Saque encontrado na tabela');
        console.log(verification);
      }
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testWithdrawalCreation();