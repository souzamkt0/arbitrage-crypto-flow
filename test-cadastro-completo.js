// Script para testar cadastro completo de usuário
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCadastroCompleto() {
  try {
    console.log('🧪 === TESTE DE CADASTRO COMPLETO ===');
    
    const timestamp = Date.now();
    const userData = {
      email: `usuario${timestamp}@teste.com`,
      password: '123456',
      firstName: 'João',
      lastName: 'Silva',
      username: `joaosilva${timestamp}`,
      cpf: '123.456.789-00',
      whatsapp: '(11) 99999-9999',
      referralCode: null
    };
    
    console.log('📝 Dados do usuário:', userData);
    console.log('🔄 Iniciando cadastro...');
    
    // 1. Criar usuário no auth
    console.log('1️⃣ Criando usuário no auth...');
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirmed: true
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro no cadastro:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Usuário criado no auth:', data.user.id);
    
    // 2. Aguardar um pouco
    console.log('2️⃣ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Criar perfil básico
    console.log('3️⃣ Criando perfil básico...');
    const generateReferralCode = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `user${timestamp}${random}`.toLowerCase();
    };
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        display_name: null,
        username: userData.username,
        first_name: null,
        last_name: null,
        cpf: null,
        whatsapp: null,
        bio: null,
        avatar: 'avatar1',
        referral_code: generateReferralCode(),
        referred_by: userData.referralCode || null,
        role: 'user',
        balance: 0.00,
        total_profit: 0.00,
        status: 'active',
        profile_completed: false
      });
    
    if (profileError) {
      console.error('❌ Erro criando perfil:', profileError.message);
      
      // Tentar deletar o usuário criado
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
        console.log('🗑️ Usuário deletado após erro no perfil');
      } catch (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError.message);
      }
      
      return { success: false, error: profileError.message };
    }
    
    console.log('✅ Perfil criado com sucesso!');
    
    // 4. Fazer login
    console.log('4️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return { success: false, error: loginError.message };
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // 5. Verificar dados do usuário
    console.log('5️⃣ Verificando dados do usuário...');
    const { data: profileData, error: profileFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileFetchError) {
      console.error('❌ Erro ao buscar perfil:', profileFetchError.message);
    } else {
      console.log('✅ Perfil encontrado:', {
        user_id: profileData.user_id,
        email: profileData.email,
        username: profileData.username,
        role: profileData.role,
        status: profileData.status,
        profile_completed: profileData.profile_completed
      });
    }
    
    console.log('🎉 === TESTE CONCLUÍDO COM SUCESSO ===');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Senha:', userData.password);
    console.log('🆔 User ID:', data.user.id);
    console.log('👤 Username:', userData.username);
    
    return { 
      success: true, 
      user: {
        email: userData.email,
        password: userData.password,
        userId: data.user.id,
        username: userData.username
      }
    };
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return { success: false, error: error.message };
  }
}

// Executar o teste
console.log('🚀 Iniciando teste de cadastro...');
testarCadastroCompleto().then(result => {
  if (result.success) {
    console.log('\n✅ SUCESSO! Usuário criado e logado:');
    console.log(`📧 Email: ${result.user.email}`);
    console.log(`🔑 Senha: ${result.user.password}`);
    console.log(`🆔 User ID: ${result.user.userId}`);
    console.log(`👤 Username: ${result.user.username}`);
  } else {
    console.log('\n❌ FALHA no teste:');
    console.log(`Erro: ${result.error}`);
  }
});

