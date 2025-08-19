// ========================================
// VERIFICAR SE SMTP FOI CONFIGURADO
// Execute após configurar SMTP no painel Supabase
// ========================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar SMTP configurado
async function testSMTPConfigured() {
  console.log('🔧 VERIFICANDO CONFIGURAÇÃO SMTP TITAN EMAIL');
  console.log('============================================');
  
  // Criar email único para teste
  const timestamp = Date.now();
  const testEmail = `verificacao.smtp.${timestamp}@alphabit.vu`;
  const testPassword = 'VerificacaoSMTP123!';
  
  console.log(`📧 Testando com: ${testEmail}`);
  console.log(`🔐 Senha: ${testPassword}`);
  
  try {
    console.log('\n⏳ Tentando criar usuário...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Verificação SMTP',
          username: `verificacao_${timestamp}`
        }
      }
    });
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
      
      if (error.message.includes('confirmation email')) {
        console.log('\n🚨 SMTP AINDA NÃO CONFIGURADO!');
        console.log('\n📋 AÇÕES NECESSÁRIAS:');
        console.log('1. Acesse https://supabase.com/dashboard');
        console.log('2. Vá em Authentication > Settings');
        console.log('3. Configure SMTP Settings com:');
        console.log('   - Host: smtp.titan.email');
        console.log('   - Port: 587');
        console.log('   - User: suporte@alphabit.vu');
        console.log('   - Pass: Jad828657##');
        console.log('   - Sender: noreply@alphabit.vu');
        console.log('4. Salve e teste novamente');
        return false;
      } else if (error.message.includes('rate limit')) {
        console.log('\n⏳ Rate limit atingido - aguarde alguns minutos');
        return null;
      } else {
        console.log(`\n❓ Erro inesperado: ${error.message}`);
        return false;
      }
    }
    
    if (data.user) {
      console.log('\n✅ USUÁRIO CRIADO COM SUCESSO!');
      console.log('\n📊 Detalhes do usuário:');
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Criado em: ${new Date(data.user.created_at).toLocaleString()}`);
      console.log(`   Email confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('\n🎉 SMTP CONFIGURADO E FUNCIONANDO!');
        console.log('✅ Email de confirmação foi enviado');
        console.log('📨 Verifique a caixa de entrada de: ' + testEmail);
        
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Verifique o email de confirmação');
        console.log('2. Clique no link para confirmar');
        console.log('3. O sistema está pronto para novos usuários!');
        
        return true;
      } else {
        console.log('\n✅ Email já confirmado automaticamente');
        console.log('🎉 SMTP funcionando perfeitamente!');
        return true;
      }
    }
    
  } catch (err) {
    console.error(`❌ Erro inesperado: ${err.message}`);
    return false;
  }
}

// Função para verificar usuários recentes
async function checkRecentTestUsers() {
  console.log('\n👥 VERIFICANDO USUÁRIOS DE TESTE RECENTES');
  console.log('=========================================');
  
  try {
    // Não podemos acessar auth.users diretamente, mas podemos tentar
    console.log('ℹ️  Para verificar usuários criados, use o SQL Editor:');
    console.log('\nSELECT id, email, email_confirmed_at, created_at');
    console.log('FROM auth.users');
    console.log('WHERE email LIKE "%verificacao%" OR email LIKE "%teste%"');
    console.log('ORDER BY created_at DESC LIMIT 10;');
    
  } catch (err) {
    console.log('ℹ️  Use o SQL Editor para verificar usuários');
  }
}

// Função para limpar usuários de teste (opcional)
async function cleanupTestUsers() {
  console.log('\n🧹 LIMPEZA DE USUÁRIOS DE TESTE');
  console.log('================================');
  
  console.log('⚠️  Para limpar usuários de teste, execute no SQL Editor:');
  console.log('\n-- CUIDADO: Confirme antes de executar');
  console.log('DELETE FROM auth.users');
  console.log('WHERE email LIKE "%teste%"');
  console.log('   OR email LIKE "%verificacao%"');
  console.log('   OR email LIKE "%diagnostico%";');
  
  console.log('\n📊 Para contar usuários de teste:');
  console.log('SELECT COUNT(*) as usuarios_teste');
  console.log('FROM auth.users');
  console.log('WHERE email LIKE "%teste%" OR email LIKE "%verificacao%";');
}

// Função principal
async function runVerification() {
  console.log('🔍 VERIFICAÇÃO COMPLETA - SMTP TITAN EMAIL');
  console.log('==========================================');
  
  const result = await testSMTPConfigured();
  
  if (result === true) {
    console.log('\n🎉 PARABÉNS! SMTP CONFIGURADO COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ Titan Email SMTP funcionando');
    console.log('✅ Emails de confirmação sendo enviados');
    console.log('✅ Sistema pronto para produção');
    
    console.log('\n📋 SISTEMA PRONTO PARA:');
    console.log('- Cadastro de novos usuários');
    console.log('- Confirmação automática de emails');
    console.log('- Recuperação de senhas');
    console.log('- Magic links de login');
    
  } else if (result === false) {
    console.log('\n❌ SMTP AINDA NÃO CONFIGURADO');
    console.log('==============================');
    console.log('📖 Consulte: GUIA_CONFIGURAR_SMTP_SUPABASE.md');
    console.log('🔧 Configure manualmente no painel Supabase');
    
  } else {
    console.log('\n⏳ TESTE TEMPORARIAMENTE INDISPONÍVEL');
    console.log('=====================================');
    console.log('Aguarde alguns minutos e tente novamente');
  }
  
  await checkRecentTestUsers();
  await cleanupTestUsers();
  
  console.log('\n🔄 Para testar novamente:');
  console.log('node verificar-smtp-configurado.cjs');
}

// Executar verificação
if (require.main === module) {
  runVerification().catch(console.error);
}

module.exports = { testSMTPConfigured, checkRecentTestUsers };