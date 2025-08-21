const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarAutenticacaoFrontend() {
  console.log('🔍 Verificando autenticação no frontend...\n');

  try {
    // 1. Verificar se há sessão ativa
    console.log('👤 1. Verificando sessão ativa...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError);
    } else {
      console.log('📋 Sessão:', session ? 'Ativa' : 'Inativa');
      if (session) {
        console.log('👤 Usuário da sessão:', session.user.id);
        console.log('📧 Email:', session.user.email);
      }
    }

    // 2. Verificar usuário atual
    console.log('\n👤 2. Verificando usuário atual...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError);
    } else {
      console.log('👤 Usuário atual:', user ? user.id : 'null/undefined');
      if (user) {
        console.log('📧 Email:', user.email);
        console.log('🔑 Último login:', user.last_sign_in_at);
      }
    }

    // 3. Se não há usuário autenticado, tentar autenticar
    if (!user) {
      console.log('\n🔑 3. Tentando autenticar usuário...');
      
      // Lista de usuários para tentar autenticar
      const usersToTry = [
        { email: 'esnyce@gmail.com', password: 'test123' },
        { email: 'admin@clean.com', password: 'admin123' },
        { email: 'andreia2013s2@outlook.com', password: 'test123' }
      ];

      for (const userCred of usersToTry) {
        console.log(`🔑 Tentando autenticar: ${userCred.email}`);
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userCred.email,
          password: userCred.password
        });

        if (authError) {
          console.log(`❌ Falha na autenticação de ${userCred.email}:`, authError.message);
        } else {
          console.log(`✅ Autenticação bem-sucedida para ${userCred.email}!`);
          console.log('👤 ID do usuário:', authData.user.id);
          
          // 4. Testar a Edge Function com o usuário autenticado
          console.log('\n🧪 4. Testando Edge Function com usuário autenticado...');
          
          const testData = {
            amount: 10,
            cpf: '12345678909',
            name: 'Teste Usuário',
            callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
            userId: authData.user.id
          };

          console.log('📋 Dados de teste:', testData);

          const { data: result, error: invokeError } = await supabase.functions.invoke('digitopay-deposit', {
            body: testData
          });

          if (invokeError) {
            console.error('❌ Erro na Edge Function:', invokeError);
          } else {
            console.log('✅ Edge Function funcionou!');
            console.log('📝 Resultado:', result);
          }
          
          break; // Parar após o primeiro sucesso
        }
      }
    } else {
      console.log('\n✅ Usuário já está autenticado!');
      
      // 5. Testar a Edge Function com o usuário já autenticado
      console.log('\n🧪 5. Testando Edge Function com usuário já autenticado...');
      
      const testData = {
        amount: 10,
        cpf: '12345678909',
        name: 'Teste Usuário',
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook',
        userId: user.id
      };

      console.log('📋 Dados de teste:', testData);

      const { data: result, error: invokeError } = await supabase.functions.invoke('digitopay-deposit', {
        body: testData
      });

      if (invokeError) {
        console.error('❌ Erro na Edge Function:', invokeError);
      } else {
        console.log('✅ Edge Function funcionou!');
        console.log('📝 Resultado:', result);
      }
    }

    // 6. Verificar se há algum problema com o hook useAuth
    console.log('\n🔧 6. Verificando se há problemas com autenticação...');
    
    // Verificar se há algum problema com o localStorage ou cookies
    console.log('📋 Verificando se há dados de autenticação salvos...');
    
    // Simular o que o hook useAuth faz
    const { data: { user: finalUser } } = await supabase.auth.getUser();
    
    if (finalUser) {
      console.log('✅ Usuário autenticado no final:', finalUser.id);
      console.log('📧 Email:', finalUser.email);
    } else {
      console.log('❌ Nenhum usuário autenticado no final');
      console.log('💡 SUGESTÃO: O problema pode estar no hook useAuth ou na configuração de autenticação');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarAutenticacaoFrontend();
