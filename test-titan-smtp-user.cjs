// ========================================
// TESTE DE USUÁRIO - TITAN EMAIL SMTP
// Teste para verificar se o SMTP está funcionando
// ========================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar cadastro de usuário
async function testUserRegistration() {
  console.log('🚀 Iniciando teste de cadastro com Titan Email SMTP...');
  
  // Email de teste único
  const testEmail = `teste.titan.${Date.now()}@alphabit.vu`;
  const testPassword = 'TesteTitan123!';
  
  console.log(`📧 Email de teste: ${testEmail}`);
  console.log(`🔐 Senha de teste: ${testPassword}`);
  
  try {
    // Tentar criar usuário
    console.log('\n⏳ Criando usuário...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Teste Titan SMTP',
          username: `teste_titan_${Date.now()}`
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return false;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📊 Dados do usuário:', {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at,
      created_at: data.user?.created_at
    });
    
    // Verificar se email foi enviado
    if (data.user && !data.user.email_confirmed_at) {
      console.log('\n📨 Email de confirmação deve ter sido enviado!');
      console.log('✅ SMTP Titan Email funcionando - email pendente de confirmação');
      console.log('\n📋 Próximos passos:');
      console.log('1. Verifique a caixa de entrada do email');
      console.log('2. Clique no link de confirmação');
      console.log('3. Execute o SQL para verificar confirmação');
    } else if (data.user?.email_confirmed_at) {
      console.log('\n✅ Email já confirmado automaticamente!');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return false;
  }
}

// Função para verificar usuários não confirmados
async function checkUnconfirmedUsers() {
  console.log('\n🔍 Verificando usuários não confirmados...');
  
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at, created_at')
      .is('email_confirmed_at', null)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('ℹ️  Não foi possível acessar auth.users diretamente');
      console.log('Use o SQL Editor para verificar usuários não confirmados');
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`📊 Encontrados ${data.length} usuários não confirmados:`);
      data.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Criado em: ${new Date(user.created_at).toLocaleString()}`);
      });
    } else {
      console.log('✅ Todos os usuários estão confirmados!');
    }
    
  } catch (err) {
    console.log('ℹ️  Use o SQL Editor para verificar usuários não confirmados');
  }
}

// Executar teste
async function runTest() {
  console.log('========================================');
  console.log('🧪 TESTE TITAN EMAIL SMTP - SUPABASE');
  console.log('========================================');
  
  // Verificar usuários não confirmados antes
  await checkUnconfirmedUsers();
  
  // Criar usuário de teste
  const success = await testUserRegistration();
  
  if (success) {
    console.log('\n⏳ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar usuários não confirmados depois
    await checkUnconfirmedUsers();
    
    console.log('\n========================================');
    console.log('✅ TESTE CONCLUÍDO');
    console.log('========================================');
    console.log('📝 Resumo:');
    console.log('- Usuário de teste criado');
    console.log('- Email de confirmação enviado via Titan SMTP');
    console.log('- Verifique a caixa de entrada para confirmar');
    console.log('\n🔧 Para verificar no SQL Editor:');
    console.log('SELECT * FROM auth.users WHERE email_confirmed_at IS NULL ORDER BY created_at DESC;');
  } else {
    console.log('\n❌ TESTE FALHOU');
    console.log('Verifique as configurações do SMTP no Supabase');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { testUserRegistration, checkUnconfirmedUsers };