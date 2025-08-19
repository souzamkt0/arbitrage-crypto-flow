import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarConfirmacaoEmail() {
  console.log('🔍 Testando Confirmação de Email...');
  console.log('=' .repeat(60));

  try {
    // 1. Testar login com usuário existente
    console.log('\n1️⃣ Testando login com usuário existente...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'souzamkt0@gmail.com',
      password: '123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n📧 PROBLEMA: Email não confirmado!');
        console.log('\n🔧 SOLUÇÃO IMEDIATA:');
        console.log('1. Execute o arquivo: confirmar-emails-manualmente.sql');
        console.log('2. Ou acesse o painel do Supabase e confirme manualmente');
        console.log('3. URL: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
        
        return false;
      } else if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔐 Email confirmado, mas credenciais incorretas');
        console.log('✅ Isso significa que a confirmação está funcionando!');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log(`   - Email: ${loginData.user.email}`);
      console.log(`   - Confirmado em: ${loginData.user.email_confirmed_at}`);
      console.log('✅ Email está confirmado!');
    }

    // 2. Testar signup para verificar se confirmação está ativa
    console.log('\n2️⃣ Testando processo de signup...');
    const testEmail = `teste${Date.now()}@exemplo.com`;
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Teste',
          last_name: 'Usuario'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no signup:', signupError.message);
      
      if (signupError.message.includes('Error sending confirmation email')) {
        console.log('\n📧 PROBLEMA: Erro ao enviar email de confirmação');
        console.log('\n🔧 POSSÍVEIS CAUSAS:');
        console.log('1. ❌ SMTP não configurado corretamente');
        console.log('2. ❌ Credenciais SMTP inválidas');
        console.log('3. ❌ Servidor SMTP bloqueado');
        console.log('4. ❌ Rate limit do provedor de email');
        
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. Desabilitar confirmação de email temporariamente');
        console.log('2. Configurar SMTP corretamente');
        console.log('3. Confirmar emails manualmente via SQL');
        
      } else if (signupError.message.includes('rate limit')) {
        console.log('\n⏱️ RATE LIMIT: Muitas tentativas');
        console.log('✅ Isso indica que o SMTP está tentando funcionar');
        console.log('🔧 Aguarde alguns minutos e teste novamente');
        
      } else {
        console.log('\n❓ Erro desconhecido:', signupError.message);
      }
    } else {
      console.log('✅ Signup realizado com sucesso!');
      
      if (signupData.session) {
        console.log('🎉 CONFIRMAÇÃO DESABILITADA: Usuário logado automaticamente');
        console.log('✅ Sistema funcionando sem confirmação de email');
      } else {
        console.log('📧 CONFIRMAÇÃO ATIVA: Email de confirmação enviado');
        console.log('⚠️ Usuário precisa confirmar email para fazer login');
        
        if (signupData.user && !signupData.user.email_confirmed_at) {
          console.log('❌ Email não confirmado automaticamente');
        }
      }
    }

    // 3. Verificar configurações atuais
    console.log('\n3️⃣ Verificando configurações...');
    
    // Tentar fazer logout para limpar sessão
    await supabase.auth.signOut();
    
    console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
    console.log('=' .repeat(40));
    
    if (loginError && loginError.message.includes('Email not confirmed')) {
      console.log('❌ Usuários existentes: Emails não confirmados');
      console.log('🔧 Ação necessária: Execute confirmar-emails-manualmente.sql');
    } else {
      console.log('✅ Usuários existentes: Emails confirmados');
    }
    
    if (signupError && signupError.message.includes('Error sending confirmation email')) {
      console.log('❌ Novos usuários: SMTP com problemas');
      console.log('🔧 Ação necessária: Configurar SMTP ou desabilitar confirmação');
    } else if (signupData && !signupData.session) {
      console.log('⚠️ Novos usuários: Confirmação de email ativa');
      console.log('📧 Emails sendo enviados (se SMTP estiver OK)');
    } else if (signupData && signupData.session) {
      console.log('✅ Novos usuários: Confirmação desabilitada');
      console.log('🎉 Login automático após cadastro');
    }

    // 4. Instruções finais
    console.log('\n4️⃣ Próximos passos...');
    console.log('\n🔧 PARA RESOLVER COMPLETAMENTE:');
    console.log('\n📝 OPÇÃO 1 - Desabilitar confirmação (Recomendado para desenvolvimento):');
    console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
    console.log('2. Vá para Authentication > Settings');
    console.log('3. Desmarque "Enable email confirmations"');
    console.log('4. Clique em "Save"');
    console.log('5. Execute: confirmar-emails-manualmente.sql');
    
    console.log('\n📧 OPÇÃO 2 - Configurar SMTP (Para produção):');
    console.log('1. Vá para Authentication > Settings > SMTP Settings');
    console.log('2. Configure um provedor confiável (Gmail, SendGrid, etc.)');
    console.log('3. Teste o envio de email');
    console.log('4. Execute: confirmar-emails-manualmente.sql para usuários existentes');
    
    console.log('\n🚀 OPÇÃO 3 - Confirmação manual (Temporária):');
    console.log('1. Execute: confirmar-emails-manualmente.sql');
    console.log('2. Ou confirme cada usuário manualmente no painel');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar teste
testarConfirmacaoEmail()
  .then((sucesso) => {
    console.log('\n' + '='.repeat(60));
    if (sucesso) {
      console.log('🏁 Diagnóstico concluído!');
      console.log('📋 Siga as instruções acima para resolver o problema.');
    } else {
      console.log('❌ Erro durante o diagnóstico.');
    }
  })
  .catch(console.error);