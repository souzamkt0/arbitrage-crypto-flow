// ========================================
// VERIFICAR STATUS SMTP - SUPABASE
// Script para diagnosticar configurações
// ========================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Função para verificar configurações
async function checkSupabaseConfig() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÕES SUPABASE');
  console.log('========================================');
  
  // Verificar URL e chaves
  console.log('📊 Configurações básicas:');
  console.log(`✅ Supabase URL: ${supabaseUrl}`);
  console.log(`✅ Anon Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NÃO ENCONTRADA'}`);
  console.log(`${supabaseServiceKey ? '✅' : '❌'} Service Role Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NÃO ENCONTRADA'}`);
  
  console.log('\n🔐 Testando autenticação...');
  
  try {
    // Testar conexão básica
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Invalid JWT') {
      console.log(`❌ Erro de conexão: ${error.message}`);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }
    
  } catch (err) {
    console.log(`❌ Erro inesperado: ${err.message}`);
  }
}

// Função para testar configurações de email
async function testEmailConfig() {
  console.log('\n📧 TESTANDO CONFIGURAÇÕES DE EMAIL');
  console.log('========================================');
  
  try {
    // Tentar um signup simples para ver o erro específico
    const testEmail = `diagnostico.${Date.now()}@alphabit.vu`;
    console.log(`📨 Testando com email: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TesteDiagnostico123!',
      options: {
        data: {
          full_name: 'Teste Diagnóstico'
        }
      }
    });
    
    if (error) {
      console.log(`❌ Erro específico: ${error.message}`);
      
      // Analisar tipos de erro
      if (error.message.includes('confirmation email')) {
        console.log('\n🔧 DIAGNÓSTICO:');
        console.log('- SMTP não está configurado no Supabase');
        console.log('- Configure manualmente no painel Authentication > Settings');
        console.log('- Use as credenciais do Titan Email fornecidas');
      } else if (error.message.includes('rate limit')) {
        console.log('\n⏳ DIAGNÓSTICO:');
        console.log('- Muitas tentativas de cadastro');
        console.log('- Aguarde alguns minutos antes de testar novamente');
      } else if (error.message.includes('invalid email')) {
        console.log('\n📧 DIAGNÓSTICO:');
        console.log('- Formato de email inválido');
        console.log('- Verifique se o domínio alphabit.vu está correto');
      }
      
      return false;
    }
    
    if (data.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`📊 ID: ${data.user.id}`);
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`✉️ Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('\n✅ SMTP FUNCIONANDO!');
        console.log('- Email de confirmação foi enviado');
        console.log('- Verifique a caixa de entrada');
      }
      
      return true;
    }
    
  } catch (err) {
    console.log(`❌ Erro inesperado: ${err.message}`);
    return false;
  }
}

// Função para verificar usuários recentes
async function checkRecentUsers() {
  console.log('\n👥 VERIFICANDO USUÁRIOS RECENTES');
  console.log('========================================');
  
  if (!supabaseAdmin) {
    console.log('❌ Service Role Key necessária para acessar dados de usuários');
    console.log('ℹ️  Use o SQL Editor para verificar: SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;');
    return;
  }
  
  try {
    // Tentar acessar usuários (requer service role key)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 5
    });
    
    if (error) {
      console.log(`❌ Erro ao acessar usuários: ${error.message}`);
      return;
    }
    
    if (data.users && data.users.length > 0) {
      console.log(`📊 Encontrados ${data.users.length} usuários recentes:`);
      
      data.users.forEach((user, index) => {
        const status = user.email_confirmed_at ? '✅ Confirmado' : '⏳ Pendente';
        const created = new Date(user.created_at).toLocaleString();
        console.log(`${index + 1}. ${user.email} - ${status} - ${created}`);
      });
      
      const unconfirmed = data.users.filter(u => !u.email_confirmed_at).length;
      if (unconfirmed > 0) {
        console.log(`\n⚠️  ${unconfirmed} usuário(s) com email não confirmado`);
        console.log('Isso pode indicar problemas no envio de emails');
      }
    } else {
      console.log('ℹ️  Nenhum usuário encontrado');
    }
    
  } catch (err) {
    console.log(`❌ Erro ao verificar usuários: ${err.message}`);
  }
}

// Função principal
async function runDiagnostic() {
  console.log('🔧 DIAGNÓSTICO COMPLETO - TITAN EMAIL SMTP');
  console.log('==========================================');
  
  await checkSupabaseConfig();
  await checkRecentUsers();
  const emailWorking = await testEmailConfig();
  
  console.log('\n📋 RESUMO DO DIAGNÓSTICO');
  console.log('========================================');
  
  if (emailWorking) {
    console.log('✅ SMTP configurado e funcionando!');
    console.log('✅ Emails de confirmação sendo enviados');
    console.log('\n🎉 Sistema pronto para uso!');
  } else {
    console.log('❌ SMTP não configurado ou com problemas');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o painel Supabase');
    console.log('2. Vá em Authentication > Settings');
    console.log('3. Configure SMTP com credenciais Titan Email');
    console.log('4. Execute este diagnóstico novamente');
    console.log('\n📖 Consulte: CONFIGURAR_TITAN_SMTP_MANUAL.md');
  }
}

// Executar diagnóstico
if (require.main === module) {
  runDiagnostic().catch(console.error);
}

module.exports = { checkSupabaseConfig, testEmailConfig, checkRecentUsers };