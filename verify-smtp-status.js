import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyCurrentStatus() {
  console.log('🔍 Verificando Status Atual do Sistema...');
  console.log('=' .repeat(60));

  try {
    // 1. Testar login com usuário existente
    console.log('\n1️⃣ Testando login com usuário existente...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'souzamkt0@gmail.com',
      password: 'Souza123!'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('📧 PROBLEMA: Email não confirmado');
        console.log('🔧 SOLUÇÃO: Confirmar email manualmente ou desabilitar confirmação');
      } else if (loginError.message.includes('Invalid login credentials')) {
        console.log('🔐 PROBLEMA: Credenciais inválidas');
        console.log('🔧 SOLUÇÃO: Verificar email/senha ou resetar senha');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', loginData.user?.email);
      console.log('📧 Email confirmado:', loginData.user?.email_confirmed_at ? 'SIM' : 'NÃO');
    }

    // 2. Verificar configuração atual
    console.log('\n2️⃣ Analisando configuração atual...');
    
    // Tentar signup com email único para testar SMTP
    const testEmail = `teste.final.${Date.now()}@example.com`;
    console.log(`📧 Testando com email: ${testEmail}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Teste',
          last_name: 'Final'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no signup:', signupError.message);
      
      if (signupError.message.includes('Error sending confirmation email')) {
        console.log('\n❌ SMTP NÃO ESTÁ FUNCIONANDO');
        console.log('🔧 As configurações SMTP salvas têm problemas');
        
        console.log('\n📋 VERIFICAÇÕES NECESSÁRIAS:');
        console.log('1. ❌ Servidor SMTP incorreto');
        console.log('2. ❌ Porta SMTP incorreta');
        console.log('3. ❌ Credenciais inválidas');
        console.log('4. ❌ Senha de app incorreta (Gmail)');
        console.log('5. ❌ 2FA não habilitado (Gmail)');
        
      } else if (signupError.message.includes('rate limit')) {
        console.log('\n⏱️ RATE LIMIT ATINGIDO');
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
        console.log('📧 CONFIRMAÇÃO HABILITADA: Email de confirmação enviado');
        console.log('✅ SMTP funcionando corretamente!');
      }
    }

    // 3. Resumo e recomendações
    console.log('\n3️⃣ Resumo da Análise...');
    console.log('\n📊 STATUS ATUAL:');
    
    if (signupError && signupError.message.includes('Error sending confirmation email')) {
      console.log('❌ SMTP: NÃO FUNCIONANDO');
      console.log('❌ Configurações: INCORRETAS');
      console.log('🔧 Ação: REVISAR CONFIGURAÇÕES SMTP');
      
      console.log('\n🎯 SOLUÇÕES IMEDIATAS:');
      console.log('1. 🔧 Revisar configurações SMTP no painel');
      console.log('2. 📧 Testar com "Send test email" no Supabase');
      console.log('3. 🔐 Verificar senha de app (se Gmail)');
      console.log('4. ⚡ Desabilitar confirmação temporariamente');
      
    } else if (signupError && signupError.message.includes('rate limit')) {
      console.log('⏱️ SMTP: PROVAVELMENTE FUNCIONANDO');
      console.log('✅ Configurações: CORRETAS');
      console.log('🔧 Ação: AGUARDAR RATE LIMIT');
      
    } else if (signupData?.session) {
      console.log('✅ SISTEMA: FUNCIONANDO');
      console.log('📧 Confirmação: DESABILITADA');
      console.log('🎉 Ação: NENHUMA NECESSÁRIA');
      
    } else if (signupData && !signupData.session) {
      console.log('✅ SMTP: FUNCIONANDO PERFEITAMENTE');
      console.log('📧 Confirmação: HABILITADA E FUNCIONANDO');
      console.log('🎉 Ação: SISTEMA PERFEITO');
    }

    // 4. Próximos passos específicos
    console.log('\n4️⃣ Próximos Passos...');
    
    if (loginError && loginError.message.includes('Email not confirmed')) {
      console.log('\n🔧 PARA USUÁRIOS EXISTENTES:');
      console.log('1. Execute o SQL: fix-email-confirmation-issue.sql');
      console.log('2. Ou confirme emails manualmente no painel');
      console.log('3. Ou desabilite confirmação temporariamente');
    }
    
    if (signupError && signupError.message.includes('Error sending confirmation email')) {
      console.log('\n🔧 PARA CORRIGIR SMTP:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
      console.log('2. Authentication > Settings > SMTP Settings');
      console.log('3. Clique em "Send test email" para testar');
      console.log('4. Se falhar, revise TODAS as configurações');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Verificação concluída!');
}

// Executar verificação
verifyCurrentStatus().catch(console.error);