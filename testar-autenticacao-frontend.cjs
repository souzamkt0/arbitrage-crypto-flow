const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarAutenticacaoFrontend() {
  console.log('🧪 Testando autenticação como no frontend...\n');

  try {
    // 1. Simular o que acontece no frontend
    console.log('👤 1. Verificando usuário atual...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError);
      return;
    }

    if (!user) {
      console.log('❌ Nenhum usuário autenticado');
      console.log('🔑 Tentando autenticar...');
      
      // Tentar autenticar com email/senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'esnyce@gmail.com',
        password: 'test123'
      });

      if (authError) {
        console.error('❌ Erro na autenticação:', authError);
        return;
      }

      console.log('✅ Usuário autenticado:', authData.user.id);
    } else {
      console.log('✅ Usuário já autenticado:', user.id);
    }

    // 2. Simular a chamada da Edge Function como no frontend
    console.log('\n🚀 2. Simulando chamada da Edge Function...');
    
    const testData = {
      amount: 10,
      cpf: '12345678909',
      name: 'Teste Usuário',
      callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
      userId: user?.id || '0a9325f4-911d-431b-a8ae-1132b4167711'
    };

    console.log('📋 Dados de teste:', testData);

    // Chamar Edge Function usando supabase.functions.invoke (como no frontend)
    console.log('\n📡 3. Chamando Edge Function via supabase.functions.invoke...');
    
    const { data: result, error: invokeError } = await supabase.functions.invoke('digitopay-deposit', {
      body: testData
    });

    if (invokeError) {
      console.error('❌ Erro na chamada da Edge Function:', invokeError);
      console.error('📝 Detalhes do erro:', JSON.stringify(invokeError, null, 2));
    } else {
      console.log('✅ Edge Function executada com sucesso!');
      console.log('📝 Resultado:', result);
    }

    // 4. Comparar com chamada direta via fetch
    console.log('\n📡 4. Comparando com chamada direta via fetch...');
    
    const fetchResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Status da resposta fetch:', fetchResponse.status);
    const fetchResult = await fetchResponse.json();
    console.log('📝 Resultado fetch:', fetchResult);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarAutenticacaoFrontend();
