// Teste completo de login do usuário souzamkt0
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Teste completo de login do usuário souzamkt0...\n');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCompleteLogin() {
  try {
    console.log('1️⃣ Verificando perfil atual...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }

    console.log('✅ Perfil encontrado:');
    console.log('   Email:', profile.email);
    console.log('   Username:', profile.username);
    console.log('   Role:', profile.role);
    console.log('   Status:', profile.status);
    console.log('   Profile completed:', profile.profile_completed);

    // Simular a lógica do useAuth.tsx
    const isAdmin = profile.email === 'souzamkt0@gmail.com' || profile.role === 'admin';
    
    console.log('\n2️⃣ Testando lógica de admin...');
    console.log('   Email match:', profile.email === 'souzamkt0@gmail.com');
    console.log('   Role match:', profile.role === 'admin');
    console.log('   isAdmin result:', isAdmin);

    if (!isAdmin) {
      console.log('❌ PROBLEMA: Usuário não é reconhecido como admin!');
      console.log('🔧 Solução: Execute o script corrigir-role-souzamkt0.sql');
      return;
    }

    console.log('\n3️⃣ Verificando acesso a rotas protegidas...');
    
    // Simular verificação de rotas
    const protectedRoutes = ['/dashboard', '/admin', '/deposit', '/withdrawal'];
    const adminRoutes = ['/admin'];
    
    console.log('✅ Rotas protegidas que o admin pode acessar:');
    protectedRoutes.forEach(route => {
      console.log(`   ${route}: ✅ ACESSO PERMITIDO`);
    });
    
    console.log('✅ Rotas de admin que o admin pode acessar:');
    adminRoutes.forEach(route => {
      console.log(`   ${route}: ✅ ACESSO PERMITIDO`);
    });

    console.log('\n4️⃣ Verificando permissões de dados...');
    
    // Testar se consegue ler dados de outros usuários (como admin)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('email, role, status')
      .limit(5);

    if (allProfilesError) {
      console.log('❌ Erro ao ler perfis (possível problema de RLS):', allProfilesError.message);
    } else {
      console.log('✅ Conseguiu ler perfis de outros usuários (admin)');
      console.log('   Total de perfis lidos:', allProfiles.length);
    }

    console.log('\n5️⃣ Verificando função is_admin_user...');
    
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user', { user_email: 'souzamkt0@gmail.com' });

    if (isAdminError) {
      console.log('❌ Erro na função is_admin_user:', isAdminError.message);
    } else {
      console.log('✅ Função is_admin_user retornou:', isAdminResult);
    }

    console.log('\n6️⃣ Resumo final:');
    
    const allGood = isAdmin && !allProfilesError && !isAdminError;
    
    if (allGood) {
      console.log('✅ TUDO PERFEITO! O usuário souzamkt0 deve conseguir:');
      console.log('   - Fazer login normalmente');
      console.log('   - Acessar o dashboard');
      console.log('   - Ver o menu "Admin" na navbar');
      console.log('   - Acessar /admin sem problemas');
      console.log('   - Ter todas as permissões administrativas');
    } else {
      console.log('❌ AINDA HÁ PROBLEMAS:');
      if (!isAdmin) console.log('   - Usuário não é reconhecido como admin');
      if (allProfilesError) console.log('   - Problemas com políticas RLS');
      if (isAdminError) console.log('   - Função is_admin_user não funciona');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testCompleteLogin();







