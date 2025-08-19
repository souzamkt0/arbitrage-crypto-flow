import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function correcaoAutomatica() {
  console.log('🔧 Correção Automática do Sistema de Email');
  console.log('=' .repeat(60));

  console.log('\n📋 INSTRUÇÕES PARA CORREÇÃO MANUAL:');
  console.log('\n1️⃣ ACESSE O PAINEL SUPABASE:');
  console.log('   https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
  
  console.log('\n2️⃣ VÁ PARA SQL EDITOR E EXECUTE:');
  console.log('   -- Confirmar todos os emails não confirmados');
  console.log('   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;');
  
  console.log('\n3️⃣ DESABILITAR CONFIRMAÇÃO DE EMAIL:');
  console.log('   Authentication > Settings');
  console.log('   Desmarque: "Enable email confirmations"');
  console.log('   Clique em: "Save"');
  
  console.log('\n4️⃣ CONFIGURAR SMTP GMAIL (OPCIONAL):');
  console.log('   Authentication > Settings > SMTP Settings');
  console.log('   SMTP Host: smtp.gmail.com');
  console.log('   SMTP Port: 587');
  console.log('   SMTP User: souzamkt0@gmail.com');
  console.log('   SMTP Pass: [SENHA DE APP - 16 CARACTERES]');
  console.log('   Sender Name: Arbitrage Crypto Flow');
  console.log('   Sender Email: souzamkt0@gmail.com');
  
  console.log('\n🔑 COMO GERAR SENHA DE APP:');
  console.log('   1. https://myaccount.google.com/');
  console.log('   2. Segurança > Verificação em duas etapas');
  console.log('   3. Senhas de app > Gerar nova senha');
  console.log('   4. Use a senha de 16 caracteres no SMTP Pass');
  
  console.log('\n🧪 TESTANDO CONFIGURAÇÃO ATUAL...');
  
  try {
    // Testar login com usuário existente
    console.log('\n📧 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'souzamkt0@gmail.com',
      password: 'Souza123!'
    });
    
    if (loginError) {
      console.log('❌ Login falhou:', loginError.message);
      if (loginError.message.includes('Email not confirmed')) {
        console.log('🔧 SOLUÇÃO: Execute o SQL de confirmação manual');
      }
    } else {
      console.log('✅ Login funcionando!');
    }
    
    // Testar signup para verificar SMTP
    console.log('\n📧 Testando signup...');
    const testEmail = `teste.final.${Date.now()}@example.com`;
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    if (signupError) {
      console.log('❌ Signup falhou:', signupError.message);
      if (signupError.message.includes('Error sending confirmation email')) {
        console.log('🔧 SOLUÇÃO: Configure SMTP ou desabilite confirmação');
      } else if (signupError.message.includes('rate limit')) {
        console.log('⏱️ Rate limit atingido - aguarde ou desabilite confirmação');
      }
    } else {
      console.log('✅ Signup funcionando!');
    }
    
  } catch (err) {
    console.error('❌ Erro no teste:', err.message);
  }
  
  console.log('\n🎯 RESUMO DAS AÇÕES:');
  console.log('✅ 1. Execute o SQL para confirmar emails existentes');
  console.log('✅ 2. Desabilite confirmação de email no painel');
  console.log('✅ 3. Configure SMTP Gmail se quiser emails funcionando');
  console.log('✅ 4. Teste cadastro de novos usuários');
  
  console.log('\n📞 ARQUIVOS DE SUPORTE:');
  console.log('- confirmar-emails-manualmente.sql');
  console.log('- CORRIGIR_EMAIL_DEFINITIVO.md');
  console.log('- configurar-smtp-gmail.js');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Correção automática concluída!');
  console.log('📋 Siga as instruções acima para resolver o problema.');
}

correcaoAutomatica().catch(console.error);