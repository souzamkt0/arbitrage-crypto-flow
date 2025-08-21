const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarEdgeFunction() {
  console.log('🧪 Testando Edge Function digitopay-deposit...\n');

  try {
    // 1. Primeiro, vamos autenticar um usuário
    console.log('👤 1. Autenticando usuário...');
    
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'esnyce@gmail.com',
      password: 'test123' // Assumindo uma senha de teste
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError);
      console.log('🔑 Tentando com dados diferentes...');
      
      // Tentar com dados diferentes
      const testData = {
        amount: 10,
        cpf: '12345678909',
        name: 'Teste Usuário',
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
        userId: '0a9325f4-911d-431b-a8ae-1132b4167711' // UUID válido
      };

      console.log('📋 Dados de teste:', testData);

      // 2. Testar Edge Function diretamente
      console.log('\n🚀 2. Chamando Edge Function...');
      
      const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📡 Corpo da resposta:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('📡 Dados parseados:', responseData);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta:', parseError);
        console.log('📡 Resposta como texto:', responseText);
      }

      if (response.ok) {
        console.log('✅ Edge Function executada com sucesso!');
      } else {
        console.error('❌ Edge Function retornou erro:', response.status);
      }

    } else {
      console.log('✅ Usuário autenticado:', user.id);
      
      // Testar com usuário autenticado
      const testData = {
        amount: 10,
        cpf: '12345678909',
        name: 'Teste Usuário',
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
        userId: user.id
      };

      console.log('📋 Dados de teste com usuário autenticado:', testData);

      const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Status da resposta:', response.status);
      const responseText = await response.text();
      console.log('📡 Corpo da resposta:', responseText);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testarEdgeFunction();
