const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSemAutenticacao() {
  console.log('🧪 Testando sem autenticação (como no frontend)...\n');

  try {
    // 1. Simular o que acontece no frontend quando não há usuário autenticado
    console.log('👤 1. Simulando usuário não autenticado...');
    
    // Simular o que acontece no DigitoPayService.createDeposit
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('👤 Usuário obtido:', user ? user.id : 'null/undefined');
    
    // 2. Simular a chamada da Edge Function com userId undefined/null
    console.log('\n🚀 2. Chamando Edge Function com userId undefined...');
    
    const testData = {
      amount: 10,
      cpf: '12345678909',
      name: 'Teste Usuário',
      callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
      userId: user?.id // Isso será undefined
    };

    console.log('📋 Dados de teste:', testData);
    console.log('🔍 userId será:', testData.userId);

    // Chamar Edge Function usando supabase.functions.invoke
    console.log('\n📡 3. Chamando Edge Function...');
    
    const { data: result, error: invokeError } = await supabase.functions.invoke('digitopay-deposit', {
      body: testData
    });

    if (invokeError) {
      console.error('❌ Erro na chamada da Edge Function:', invokeError);
      console.error('📝 Detalhes do erro:', JSON.stringify(invokeError, null, 2));
      
      // Verificar se é o erro que estamos vendo no frontend
      if (invokeError.message && invokeError.message.includes('non-2xx status code')) {
        console.log('🎯 ENCONTRAMOS O ERRO DO FRONTEND!');
      }
    } else {
      console.log('✅ Edge Function executada com sucesso!');
      console.log('📝 Resultado:', result);
    }

    // 3. Testar com userId válido para comparação
    console.log('\n🔧 4. Testando com userId válido...');
    
    const testDataValid = {
      ...testData,
      userId: '0a9325f4-911d-431b-a8ae-1132b4167711' // UUID válido
    };

    console.log('📋 Dados de teste com userId válido:', testDataValid);

    const { data: resultValid, error: invokeErrorValid } = await supabase.functions.invoke('digitopay-deposit', {
      body: testDataValid
    });

    if (invokeErrorValid) {
      console.error('❌ Erro mesmo com userId válido:', invokeErrorValid);
    } else {
      console.log('✅ Edge Function funcionou com userId válido!');
      console.log('📝 Resultado:', resultValid);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarSemAutenticacao();
