import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugAuthState() {
  console.log('🔍 Debugando estado de autenticação...');
  
  try {
    // 1. Verificar sessão atual
    console.log('\n1️⃣ Verificando sessão atual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
    } else if (session) {
      console.log('✅ Sessão ativa encontrada:');
      console.log('   - User ID:', session.user.id);
      console.log('   - Email:', session.user.email);
      console.log('   - Expires at:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('❌ Nenhuma sessão ativa encontrada');
      return;
    }
    
    // 2. Verificar perfil do usuário
    console.log('\n2️⃣ Verificando perfil do usuário...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao obter perfil:', profileError.message);
      
      if (profileError.code === 'PGRST116') {
        console.log('⚠️  Perfil não encontrado - isso pode causar problemas!');
        console.log('💡 Solução: Criar perfil para o usuário atual');
        
        // Tentar criar perfil automaticamente
        console.log('\n🔧 Tentando criar perfil automaticamente...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: session.user.id,
            username: session.user.email.split('@')[0],
            display_name: session.user.email.split('@')[0],
            bio: 'Trader iniciante aprendendo sobre arbitragem de criptomoedas.',
            level: 1,
            earnings: 0.00
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError.message);
        } else {
          console.log('✅ Perfil criado com sucesso:', newProfile);
        }
      }
    } else {
      console.log('✅ Perfil encontrado:');
      console.log('   - Username:', profileData.username);
      console.log('   - Display Name:', profileData.display_name);
      console.log('   - Level:', profileData.level);
      console.log('   - Earnings:', profileData.earnings);
    }
    
    // 3. Verificar se há problemas com RLS
    console.log('\n3️⃣ Testando políticas RLS...');
    
    // Testar leitura de posts da comunidade
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Erro ao acessar community_posts:', postsError.message);
    } else {
      console.log('✅ Acesso a community_posts OK');
    }
    
    // 4. Simular o fluxo do useAuth
    console.log('\n4️⃣ Simulando fluxo do useAuth...');
    
    let authState = {
      user: null,
      session: null,
      profile: null,
      isLoading: true
    };
    
    console.log('Estado inicial:', authState);
    
    // Simular carregamento da sessão
    authState.session = session;
    authState.user = session?.user || null;
    console.log('Após carregar sessão:', { user: !!authState.user, session: !!authState.session });
    
    // Simular carregamento do perfil
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      authState.profile = profile;
      console.log('Após carregar perfil:', { profile: !!authState.profile });
    }
    
    authState.isLoading = false;
    console.log('Estado final:', authState);
    
    // 5. Verificar se há loops infinitos
    console.log('\n5️⃣ Verificando possíveis loops infinitos...');
    
    if (!authState.user) {
      console.log('⚠️  Usuário não autenticado - redirecionaria para /login');
    } else if (!authState.profile) {
      console.log('⚠️  Perfil não encontrado - pode causar erros na página Community');
      console.log('💡 Isso pode estar causando o comportamento de abrir/fechar!');
    } else {
      console.log('✅ Estado de autenticação parece OK');
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Função para monitorar mudanças de estado
function monitorAuthChanges() {
  console.log('\n👀 Monitorando mudanças de autenticação...');
  console.log('(Pressione Ctrl+C para parar)');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log(`\n🔄 Auth state changed: ${event}`);
      console.log('   - Session:', !!session);
      console.log('   - User:', !!session?.user);
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogado');
      } else if (event === 'SIGNED_IN') {
        console.log('👋 Usuário logado');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token renovado');
      }
    }
  );
  
  // Manter o processo rodando
  setTimeout(() => {
    subscription.unsubscribe();
    console.log('\n✅ Monitoramento finalizado');
  }, 30000); // 30 segundos
}

async function main() {
  console.log('🚀 Iniciando debug do estado de autenticação...');
  
  await debugAuthState();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DO DIAGNÓSTICO:');
  console.log('='.repeat(50));
  console.log('1. Verifique se há erros relacionados ao perfil');
  console.log('2. Se o perfil não existir, isso pode causar o problema');
  console.log('3. O ProtectedRoute pode estar causando redirecionamentos');
  console.log('4. Verifique o console do navegador para mais detalhes');
  console.log('='.repeat(50));
  
  // Opcional: monitorar mudanças
  // monitorAuthChanges();
}

main().catch(console.error);