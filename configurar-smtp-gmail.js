import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function configurarSMTP() {
  console.log('📧 Configurando SMTP para Gmail...');
  console.log('=' .repeat(60));

  console.log('\n🔧 CONFIGURAÇÕES NECESSÁRIAS NO PAINEL SUPABASE:');
  console.log('URL: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
  console.log('Navegue para: Authentication > Settings > SMTP Settings');
  console.log('');
  
  console.log('📋 CONFIGURAÇÕES GMAIL:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 SMTP Host: smtp.gmail.com');
  console.log('🔌 SMTP Port: 587');
  console.log('👤 SMTP User: souzamkt0@gmail.com');
  console.log('🔐 SMTP Pass: [SENHA DE APP - NÃO A SENHA NORMAL]');
  console.log('📧 Sender Name: Arbitrage Crypto Flow');
  console.log('📮 Sender Email: souzamkt0@gmail.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔑 COMO GERAR SENHA DE APP NO GMAIL:');
  console.log('1. Acesse: https://myaccount.google.com/');
  console.log('2. Vá para "Segurança"');
  console.log('3. Ative "Verificação em duas etapas" (se não estiver ativa)');
  console.log('4. Procure por "Senhas de app"');
  console.log('5. Gere uma nova senha para "Email"');
  console.log('6. Use essa senha de 16 caracteres no campo SMTP Pass');
  
  console.log('\n⚠️ IMPORTANTE:');
  console.log('- NÃO use a senha normal do Gmail');
  console.log('- Use APENAS a senha de app de 16 caracteres');
  console.log('- Verifique se 2FA está ativo na conta Google');
  
  console.log('\n🧪 TESTANDO CONFIGURAÇÃO ATUAL...');
  
  try {
    // Testar signup para verificar SMTP
    const testEmail = `teste.smtp.${Date.now()}@example.com`;
    console.log(`📧 Testando com: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Teste',
          last_name: 'SMTP'
        }
      }
    });
    
    if (error) {
      console.error('❌ ERRO:', error.message);
      
      if (error.message.includes('Error sending confirmation email')) {
        console.log('\n🔧 DIAGNÓSTICO:');
        console.log('❌ SMTP não configurado ou com erro');
        console.log('🔧 Siga as instruções acima para configurar');
        console.log('📧 Teste com "Send test email" no painel');
      }
    } else {
      console.log('✅ SUCESSO: Email de confirmação enviado!');
      console.log('📧 Verifique a caixa de entrada do email de teste');
      console.log('🎉 SMTP está funcionando corretamente!');
    }
    
  } catch (err) {
    console.error('❌ Erro no teste:', err.message);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Configure o SMTP no painel com as informações acima');
  console.log('2. Clique em "Send test email" para testar');
  console.log('3. Execute este script novamente para verificar');
  console.log('4. Se funcionar, execute: confirmar-emails-manualmente.sql');
  
  console.log('\n📞 ALTERNATIVAS SE NÃO FUNCIONAR:');
  console.log('🔧 OPÇÃO 1: Desabilitar confirmação de email');
  console.log('🔧 OPÇÃO 2: Usar outro provedor (SendGrid, Mailgun)');
  console.log('🔧 OPÇÃO 3: Confirmar emails manualmente via SQL');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Configuração SMTP concluída!');
}

configurarSMTP().catch(console.error);