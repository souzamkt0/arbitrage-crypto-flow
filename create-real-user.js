// Script para criar usuário real no Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pela sua chave real)
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRealUser() {
  try {
    console.log('🧪 Iniciando criação de usuário real...');
    
    const timestamp = Date.now();
    const testData = {
      email: `teste${timestamp}@teste.com`,
      password: '123456',
      userData: {
        firstName: 'João',
        lastName: 'Teste',
        username: `joaoteste${timestamp}`,
        cpf: '123.456.789-00',
        whatsapp: '(11) 99999-9999',
        referralCode: null
      }
    };
    
    console.log('📝 Dados do teste:', testData);
    
    // 1. Criar usuário no auth
    console.log('🔄 Criando usuário no auth...');
    const { data, error } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirmed: true
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro no cadastro:', error);
      return;
    }
    
    console.log('✅ Usuário criado no auth:', data.user.id);
    
    // 2. Aguardar um pouco
    console.log('⏳ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Criar perfil básico
    console.log('🔄 Criando perfil básico...');
    const generateReferralCode = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `joaoteste${timestamp}${random}`.toLowerCase();
    };
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        display_name: null,
        username: testData.userData.username,
        first_name: null,
        last_name: null,
        cpf: null,
        whatsapp: null,
        bio: null,
        avatar: 'avatar1',
        referral_code: generateReferralCode(),
        referred_by: testData.userData.referralCode || null,
        role: 'user',
        balance: 0.00,
        total_profit: 0.00,
        status: 'active',
        profile_completed: false
      });
    
    if (profileError) {
      console.error('❌ Erro criando perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil criado com sucesso!');
    
    // 4. Fazer login
    console.log('🔄 Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testData.email,
      password: testData.password
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('🎉 Usuário teste criado e logado!');
    console.log('📧 Email:', testData.email);
    console.log('🔑 Senha:', testData.password);
    console.log('🆔 User ID:', data.user.id);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
createRealUser();
