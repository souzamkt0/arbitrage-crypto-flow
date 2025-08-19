import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSMTPConfiguration() {
  console.log('📧 Testando Configuração SMTP do Supabase...');
  console.log('=' .repeat(60));

  try {
    // 1. Testar signup com email real para verificar SMTP
    console.log('\n1️⃣ Testando envio de email de confirmação...');
    const testEmail = `teste.smtp.${Date.now()}@gmail.com`;
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: '123456789',
      options: {
        data: {
          first_name: 'Teste',
          last_name: 'SMTP'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no signup:', signupError.message);
      
      if (signupError.message.includes('Error sending confirmation email')) {
        console.log('\n🔧 PROBLEMA IDENTIFICADO: Erro no envio de email');
        console.log('\n📋 POSSÍVEIS CAUSAS:');
        console.log('1. ❌ Configurações SMTP incorretas');
        console.log('2. ❌ Credenciais de email inválidas');
        console.log('3. ❌ Servidor SMTP bloqueado');
        console.log('4. ❌ Porta SMTP incorreta');
        console.log('5. ❌ Autenticação SMTP falhando');
        
        console.log('\n🔍 VERIFICAÇÕES NECESSÁRIAS:');
        console.log('1. Confirme as configurações SMTP no painel');
        console.log('2. Teste as credenciais do provedor de email');
        console.log('3. Verifique se a senha de app está correta (Gmail)');
        console.log('4. Confirme se 2FA está habilitado (se usando Gmail)');
      }
    } else {
      console.log('✅ Signup realizado com sucesso!');
      
      if (signupData.session) {
        console.log('🎉 SMTP FUNCIONANDO: Usuário logado automaticamente');
        console.log('📧 Email de confirmação não é necessário');
      } else {
        console.log('📧 Email de confirmação enviado');
        console.log('✅ SMTP configurado corretamente!');
      }
    }

    // 2. Testar com email existente para verificar reset de senha
    console.log('\n2️⃣ Testando reset de senha (SMTP)...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      'souzamkt0@gmail.com',
      {
        redirectTo: 'http://localhost:8080/reset-password'
      }
    );

    if (resetError) {
      console.error('❌ Erro no reset de senha:', resetError.message);
      
      if (resetError.message.includes('Error sending')) {
        console.log('❌ SMTP não está funcionando para reset de senha');
      }
    } else {
      console.log('✅ Email de reset enviado com sucesso!');
      console.log('📧 SMTP funcionando para reset de senha');
    }

    // 3. Análise das configurações
    console.log('\n3️⃣ Análise das Configurações...');
    console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
    
    if (signupError && signupError.message.includes('Error sending confirmation email')) {
      console.log('❌ Status SMTP: NÃO FUNCIONANDO');
      console.log('🔧 Ação necessária: Revisar configurações SMTP');
      
      console.log('\n📋 CHECKLIST DE CONFIGURAÇÃO SMTP:');
      console.log('\n🔧 Para Gmail:');
      console.log('   □ Servidor: smtp.gmail.com');
      console.log('   □ Porta: 587 (TLS) ou 465 (SSL)');
      console.log('   □ Usuário: seu-email@gmail.com');
      console.log('   □ Senha: senha de app (não a senha normal)');
      console.log('   □ 2FA habilitado na conta Google');
      
      console.log('\n🔧 Para outros provedores:');
      console.log('   □ SendGrid: smtp.sendgrid.net:587');
      console.log('   □ Mailgun: smtp.mailgun.org:587');
      console.log('   □ Outlook: smtp-mail.outlook.com:587');
      
      console.log('\n🎯 SOLUÇÕES ALTERNATIVAS:');
      console.log('1. Desabilitar confirmação de email (desenvolvimento)');
      console.log('2. Usar outro provedor SMTP');
      console.log('3. Configurar SendGrid (mais confiável)');
      
    } else {
      console.log('✅ Status SMTP: FUNCIONANDO');
      console.log('🎉 Configuração correta!');
    }

    // 4. Instruções específicas
    console.log('\n4️⃣ Próximos Passos...');
    
    if (signupError && signupError.message.includes('Error sending confirmation email')) {
      console.log('\n🔧 CORREÇÃO IMEDIATA:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
      console.log('2. Vá para Authentication > Settings > SMTP Settings');
      console.log('3. Revise TODAS as configurações');
      console.log('4. Teste com "Send test email"');
      console.log('5. Se não funcionar, desabilite email confirmation temporariamente');
      
      console.log('\n📧 PARA GMAIL - PASSO A PASSO:');
      console.log('1. Vá para https://myaccount.google.com/security');
      console.log('2. Habilite "2-Step Verification"');
      console.log('3. Vá para "App passwords"');
      console.log('4. Gere uma senha de app para "Mail"');
      console.log('5. Use essa senha no Supabase (não a senha normal)');
      
    } else {
      console.log('✅ SMTP configurado corretamente!');
      console.log('📧 Emails de confirmação devem funcionar normalmente');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Teste de SMTP concluído!');
}

// Executar teste
testSMTPConfiguration().catch(console.error);