import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testExistingUser() {
  console.log('🔍 ANÁLISE COMPLETA DO PROBLEMA:');
  console.log('='.repeat(50));
  
  // 1. Verificar usuário existente
  console.log('\n1️⃣ Verificando usuário existente no banco...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'souzamkt0');
  
  if (profilesError) {
    console.error('❌ Erro ao buscar perfil:', profilesError.message);
    return;
  }
  
  if (profiles && profiles.length > 0) {
    const profile = profiles[0];
    console.log('✅ Usuário encontrado no banco:');
    console.log(`   - Nome: ${profile.display_name}`);
    console.log(`   - Username: ${profile.username}`);
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Role: ${profile.role || 'user'}`);
  }
  
  // 2. Verificar sessão atual
  console.log('\n2️⃣ Verificando sessão atual...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Erro ao verificar sessão:', sessionError.message);
  } else if (session) {
    console.log('✅ Sessão ativa encontrada:');
    console.log(`   - Email: ${session.user.email}`);
    console.log(`   - ID: ${session.user.id}`);
  } else {
    console.log('❌ Nenhuma sessão ativa');
  }
  
  // 3. Tentar login
  console.log('\n3️⃣ Tentando fazer login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'souzamkt0@gmail.com',
    password: '123456'
  });
  
  if (loginError) {
    console.error('❌ Erro no login:', loginError.message);
    
    if (loginError.message.includes('Email not confirmed')) {
      console.log('\n📧 PROBLEMA IDENTIFICADO: Email não confirmado!');
      console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
      console.log('\nOPÇÃO 1 - Desabilitar confirmação de email:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
      console.log('2. Vá para Authentication > Settings');
      console.log('3. Desmarque "Enable email confirmations"');
      console.log('4. Clique em "Save"');
      
      console.log('\nOPÇÃO 2 - Confirmar email manualmente:');
      console.log('1. Acesse o painel do Supabase');
      console.log('2. Vá para Authentication > Users');
      console.log('3. Encontre o usuário souzamkt0@gmail.com');
      console.log('4. Clique em "Confirm email"');
      
      console.log('\nOPÇÃO 3 - Reenviar email de confirmação:');
      console.log('1. Use o botão "Resend confirmation" na tela de login');
      console.log('2. Verifique sua caixa de entrada');
    }
  } else {
    console.log('✅ Login realizado com sucesso!');
    console.log(`   - Email: ${loginData.user.email}`);
    console.log(`   - ID: ${loginData.user.id}`);
  }
  
  // 4. Verificar posts da comunidade
  console.log('\n4️⃣ Verificando posts da comunidade...');
  const { data: posts, error: postsError } = await supabase
    .from('community_posts')
    .select('*')
    .limit(3);
  
  if (postsError) {
    console.error('❌ Erro ao buscar posts:', postsError.message);
  } else {
    console.log(`✅ ${posts.length} posts encontrados na comunidade`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DO PROBLEMA:');
  console.log('❌ A página /community abre e fecha porque:');
  console.log('   1. O usuário não está autenticado');
  console.log('   2. O ProtectedRoute detecta isso');
  console.log('   3. Redireciona para /login automaticamente');
  console.log('   4. Isso causa o comportamento de "abrir e fechar"');
  console.log('');
  console.log('✅ SOLUÇÃO:');
  console.log('   1. Resolver o problema de autenticação');
  console.log('   2. Fazer login com sucesso');
  console.log('   3. A página /community funcionará normalmente');
  console.log('='.repeat(50));
}

testExistingUser().catch(console.error);