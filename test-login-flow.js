import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLoginFlow() {
  console.log('🚀 Testando fluxo de login...');
  
  // Credenciais de teste (admin master)
  const email = 'souzamkt0@gmail.com';
  const password = '123456';
  
  try {
    console.log('\n1️⃣ Tentando fazer login...');
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 Usuário não existe. Tentando registrar...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });
        
        if (signUpError) {
          console.error('❌ Erro no registro:', signUpError.message);
          return;
        }
        
        console.log('✅ Usuário registrado com sucesso!');
        console.log('📧 Verifique o email para confirmar a conta');
        
        if (signUpData.user && !signUpData.session) {
          console.log('⚠️  Confirmação de email necessária');
          return;
        }
      } else {
        return;
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
    }
    
    // 2. Verificar sessão após login
    console.log('\n2️⃣ Verificando sessão após login...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ Nenhuma sessão encontrada após login');
      return;
    }
    
    console.log('✅ Sessão ativa:');
    console.log('   - User ID:', session.user.id);
    console.log('   - Email:', session.user.email);
    
    // 3. Verificar/criar perfil
    console.log('\n3️⃣ Verificando perfil do usuário...');
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️  Perfil não encontrado. Criando...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: session.user.id,
          username: session.user.email.split('@')[0],
          display_name: 'Admin Master',
          bio: 'Administrador da plataforma Alphabit',
          level: 10,
          earnings: 50000.00,
          badge: 'Admin',
          role: 'admin'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError.message);
        return;
      }
      
      profileData = newProfile;
      console.log('✅ Perfil criado com sucesso!');
    } else if (profileError) {
      console.error('❌ Erro ao obter perfil:', profileError.message);
      return;
    }
    
    console.log('✅ Perfil encontrado:');
    console.log('   - Username:', profileData.username);
    console.log('   - Display Name:', profileData.display_name);
    console.log('   - Role:', profileData.role);
    console.log('   - Level:', profileData.level);
    
    // 4. Testar acesso às tabelas
    console.log('\n4️⃣ Testando acesso às tabelas...');
    
    // Testar community_posts
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      console.error('❌ Erro ao acessar community_posts:', postsError.message);
    } else {
      console.log('✅ Acesso a community_posts OK:', postsData.length, 'posts');
    }
    
    console.log('\n✅ Fluxo de login testado com sucesso!');
    console.log('\n💡 Agora você pode acessar /community no navegador');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

async function checkCurrentState() {
  console.log('\n🔍 Verificando estado atual...');
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log('✅ Usuário já está logado:');
    console.log('   - Email:', session.user.email);
    console.log('   - Expires:', new Date(session.expires_at * 1000).toLocaleString());
    
    // Verificar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profile) {
      console.log('✅ Perfil encontrado:', profile.display_name);
    } else {
      console.log('❌ Perfil não encontrado');
    }
  } else {
    console.log('❌ Nenhum usuário logado');
  }
}

async function main() {
  console.log('🚀 Iniciando teste do fluxo de login...');
  
  await checkCurrentState();
  await testLoginFlow();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 INSTRUÇÕES PARA RESOLVER O PROBLEMA:');
  console.log('='.repeat(60));
  console.log('1. ✅ Execute este script para fazer login');
  console.log('2. 🌐 Abra o navegador em http://localhost:8080/login');
  console.log('3. 🔑 Use as credenciais: souzamkt0@gmail.com / 123456');
  console.log('4. 📧 Se precisar confirmar email, verifique sua caixa de entrada');
  console.log('5. 🎯 Após login, acesse http://localhost:8080/community');
  console.log('6. ✨ A página não deve mais abrir e fechar!');
  console.log('='.repeat(60));
}

main().catch(console.error);