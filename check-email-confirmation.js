import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkEmailConfirmationStatus() {
  console.log('🔍 Verificando status de confirmação de email...');
  console.log('=' .repeat(60));

  try {
    // 1. Testar signup para ver se requer confirmação
    console.log('\n1️⃣ Testando processo de signup...');
    const testEmail = `teste${Date.now()}@exemplo.com`;
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: '123456',
      options: {
        data: {
          first_name: 'Teste',
          last_name: 'Usuario'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no signup:', signupError.message);
    } else {
      console.log('✅ Signup realizado com sucesso');
      console.log('📧 Email de confirmação necessário?', !signupData.session ? 'SIM' : 'NÃO');
      
      if (!signupData.session) {
        console.log('⚠️  PROBLEMA IDENTIFICADO: Confirmação de email está habilitada!');
        console.log('\n🔧 SOLUÇÕES:');
        console.log('1. Desabilitar confirmação de email no painel do Supabase');
        console.log('2. Configurar provedor de email (SMTP)');
        console.log('3. Confirmar emails manualmente via SQL');
      } else {
        console.log('✅ Confirmação de email está desabilitada - OK!');
      }
    }

    // 2. Testar login com usuário existente
    console.log('\n2️⃣ Testando login com usuário existente...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'souzamkt0@gmail.com',
      password: '123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n📧 PROBLEMA: Email não confirmado para souzamkt0@gmail.com');
        console.log('\n🔧 SOLUÇÕES IMEDIATAS:');
        console.log('\nOPÇÃO 1 - Painel do Supabase:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
        console.log('2. Vá para Authentication > Users');
        console.log('3. Encontre souzamkt0@gmail.com e clique em "Confirm email"');
        
        console.log('\nOPÇÃO 2 - Desabilitar confirmação:');
        console.log('1. Vá para Authentication > Settings');
        console.log('2. Desmarque "Enable email confirmations"');
        console.log('3. Salve as configurações');
        
        console.log('\nOPÇÃO 3 - SQL (Execute no SQL Editor):');
        console.log('UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = \'souzamkt0@gmail.com\';');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('📧 Email confirmado - OK!');
    }

    // 3. Verificar configurações de email
    console.log('\n3️⃣ Verificando configurações de email...');
    console.log('\n📋 CHECKLIST DE CONFIGURAÇÃO:');
    console.log('\n🔧 No painel do Supabase (https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix):');
    console.log('\n📧 Authentication > Settings:');
    console.log('   □ "Enable email confirmations" deve estar DESMARCADO');
    console.log('   □ Ou configurar SMTP Settings com provedor de email');
    console.log('\n👥 Authentication > Users:');
    console.log('   □ Verificar se usuários têm "Email Confirmed" = true');
    console.log('   □ Se não, clicar em "Confirm email" para cada usuário');
    
    console.log('\n🎯 RECOMENDAÇÃO:');
    console.log('Para desenvolvimento, desabilite a confirmação de email.');
    console.log('Para produção, configure um provedor SMTP adequado.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Verificação concluída!');
}

// Executar verificação
checkEmailConfirmationStatus().catch(console.error);