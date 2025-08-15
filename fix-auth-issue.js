import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser() {
  console.log('🚀 Criando usuário de teste para resolver o problema...');
  
  try {
    // Tentar criar um usuário diretamente na tabela auth.users (isso não funcionará com a chave anon)
    // Vamos usar uma abordagem diferente
    
    console.log('\n1️⃣ Verificando usuários existentes...');
    
    // Listar usuários na tabela profiles para ver se há algum
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Erro ao listar perfis:', profilesError.message);
    } else {
      console.log('📋 Perfis encontrados:', profiles.length);
      profiles.forEach(profile => {
        console.log(`   - ${profile.display_name} (${profile.username})`);
      });
    }
    
    // Vamos tentar uma abordagem diferente - criar um usuário mock
    console.log('\n2️⃣ Criando usuário mock para testes...');
    
    // Gerar um ID único para o usuário mock
    const mockUserId = 'mock-user-' + Date.now();
    
    const { data: mockProfile, error: mockError } = await supabase
      .from('profiles')
      .insert({
        id: mockUserId,
        user_id: mockUserId, // Usar o mesmo ID
        username: 'admin',
        display_name: 'Admin Master',
        bio: 'Administrador da plataforma Alphabit',
        level: 10,
        earnings: 50000.00,
        badge: 'Admin',
        role: 'admin'
      })
      .select()
      .single();
    
    if (mockError) {
      console.error('❌ Erro ao criar perfil mock:', mockError.message);
    } else {
      console.log('✅ Perfil mock criado:', mockProfile);
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

async function createCommunityPost() {
  console.log('\n3️⃣ Criando post de exemplo na comunidade...');
  
  try {
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        content: '🎉 Bem-vindos à comunidade Alphabit! Este é um post de exemplo para testar a funcionalidade.',
        user_id: 'mock-user-' + Date.now(),
        likes_count: 5,
        retweets_count: 2,
        replies_count: 1,
        shares_count: 0
      })
      .select()
      .single();
    
    if (postError) {
      console.error('❌ Erro ao criar post:', postError.message);
    } else {
      console.log('✅ Post criado:', post.content.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('💥 Erro ao criar post:', error);
  }
}

async function fixAuthConfiguration() {
  console.log('\n🔧 Instruções para corrigir a configuração de autenticação:');
  console.log('='.repeat(60));
  console.log('1. 🌐 Acesse o painel do Supabase:');
  console.log('   https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
  console.log('');
  console.log('2. 🔐 Vá para Authentication > Settings');
  console.log('');
  console.log('3. ⚙️  Desabilite "Enable email confirmations"');
  console.log('   - Encontre a opção "Enable email confirmations"');
  console.log('   - Desmarque esta opção');
  console.log('   - Clique em "Save"');
  console.log('');
  console.log('4. 🔄 Ou configure um provedor de email:');
  console.log('   - Vá para Authentication > Settings > SMTP Settings');
  console.log('   - Configure um provedor de email (Gmail, SendGrid, etc.)');
  console.log('');
  console.log('5. 🎯 Após a configuração:');
  console.log('   - Tente fazer login novamente');
  console.log('   - Use: souzamkt0@gmail.com / 123456');
  console.log('   - A página /community deve funcionar normalmente');
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Iniciando correção do problema de autenticação...');
  console.log('');
  console.log('🔍 DIAGNÓSTICO DO PROBLEMA:');
  console.log('❌ O usuário não está autenticado');
  console.log('❌ O ProtectedRoute redireciona para /login');
  console.log('❌ Isso causa o comportamento de "abrir e fechar"');
  console.log('❌ O registro requer confirmação de email');
  console.log('');
  
  await createTestUser();
  await createCommunityPost();
  await fixAuthConfiguration();
  
  console.log('\n✨ SOLUÇÃO RÁPIDA:');
  console.log('1. 🌐 Abra: http://localhost:8080/login');
  console.log('2. 🔑 Faça login com: souzamkt0@gmail.com / 123456');
  console.log('3. 📧 Se pedir confirmação, siga as instruções acima');
  console.log('4. 🎯 Acesse: http://localhost:8080/community');
  console.log('');
  console.log('💡 O problema de "abrir e fechar" será resolvido após o login!');
}

main().catch(console.error);