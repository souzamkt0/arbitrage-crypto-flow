// Teste de login do usuário souzamkt0
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testando login do usuário souzamkt0...\n');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('Verifique se o arquivo .env.local existe e contém:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

async function testSouzamkt0Login() {
  try {
    console.log('1️⃣ Verificando se o usuário existe...');
    
    // Verificar se o usuário existe na auth.users (se tiver service key)
    if (supabaseAdmin) {
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail('souzamkt0@gmail.com');
        
        if (authError) {
          console.log('❌ Erro ao verificar auth.users:', authError.message);
        } else if (authUser) {
          console.log('✅ Usuário encontrado na auth.users');
          console.log('   ID:', authUser.user.id);
          console.log('   Email confirmado:', authUser.user.email_confirmed_at ? 'Sim' : 'Não');
          console.log('   Último login:', authUser.user.last_sign_in_at);
        } else {
          console.log('❌ Usuário NÃO encontrado na auth.users');
        }
      } catch (error) {
        console.log('⚠️ Erro ao verificar auth.users:', error.message);
      }
    } else {
      console.log('⚠️ Service role key não encontrada - pulando verificação auth.users');
    }

    console.log('\n2️⃣ Verificando perfil na tabela profiles...');
    
    // Verificar perfil na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message);
    } else if (profile) {
      console.log('✅ Perfil encontrado na tabela profiles');
      console.log('   User ID:', profile.user_id);
      console.log('   Username:', profile.username);
      console.log('   Role:', profile.role);
      console.log('   Status:', profile.status);
      console.log('   Profile completed:', profile.profile_completed);
      console.log('   Balance:', profile.balance);
    } else {
      console.log('❌ Perfil NÃO encontrado na tabela profiles');
    }

    console.log('\n3️⃣ Verificando se existe na tabela partners...');
    
    // Verificar se existe na tabela partners
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (partnerError && partnerError.code !== 'PGRST116') {
      console.log('❌ Erro ao buscar partner:', partnerError.message);
    } else if (partner) {
      console.log('✅ Encontrado na tabela partners');
      console.log('   Status:', partner.status);
      console.log('   Commission rate:', partner.commission_rate);
    } else {
      console.log('⚠️ Não encontrado na tabela partners (pode ser normal)');
    }

    console.log('\n4️⃣ Testando função is_admin_user...');
    
    // Testar função is_admin_user
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user', { user_email: 'souzamkt0@gmail.com' });

    if (isAdminError) {
      console.log('❌ Erro ao testar função is_admin_user:', isAdminError.message);
    } else {
      console.log('✅ Função is_admin_user retornou:', isAdminResult);
    }

    console.log('\n5️⃣ Verificando políticas RLS...');
    
    // Verificar se consegue ler o próprio perfil
    const { data: ownProfile, error: ownProfileError } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (ownProfileError) {
      console.log('❌ Erro ao ler perfil (possível problema de RLS):', ownProfileError.message);
    } else {
      console.log('✅ Conseguiu ler perfil via RLS');
    }

    console.log('\n6️⃣ Verificando estrutura da tabela profiles...');
    
    // Verificar se a coluna role existe
    const { data: columns, error: columnsError } = await supabase
      .from('profiles')
      .select('role, profile_completed')
      .limit(1);

    if (columnsError) {
      console.log('❌ Erro ao verificar estrutura:', columnsError.message);
    } else {
      console.log('✅ Estrutura da tabela profiles OK');
    }

    console.log('\n7️⃣ Resumo do diagnóstico:');
    
    const issues = [];
    
    if (!profile) {
      issues.push('❌ Perfil não existe na tabela profiles');
    }
    
    if (profile && profile.role !== 'admin') {
      issues.push('❌ Perfil não tem role admin');
    }
    
    if (profile && !profile.profile_completed) {
      issues.push('❌ Perfil não está completo');
    }
    
    if (isAdminError) {
      issues.push('❌ Função is_admin_user não funciona');
    }
    
    if (ownProfileError) {
      issues.push('❌ Problemas com políticas RLS');
    }
    
    if (issues.length === 0) {
      console.log('✅ TUDO OK! O usuário souzamkt0 deve conseguir acessar normalmente');
    } else {
      console.log('❌ PROBLEMAS DETECTADOS:');
      issues.forEach(issue => console.log('   ' + issue));
      console.log('\n🔧 Execute o script correcao-souzamkt0-definitiva.sql para corrigir');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testSouzamkt0Login();
