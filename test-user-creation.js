// Script para testar criação de usuário
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'sua_anon_key_aqui'; // Substitua pela sua chave real

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('🧪 Iniciando criação de usuário teste...');
    
    const testData = {
      email: `teste${Date.now()}@teste.com`,
      password: '123456',
      userData: {
        firstName: 'João',
        lastName: 'Teste',
        username: 'joaoteste',
        cpf: '123.456.789-00',
        whatsapp: '(11) 99999-9999',
        referralCode: null
      }
    };
    
    console.log('📝 Dados do teste:', testData);
    
    // 1. Criar usuário no auth
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Criar perfil básico
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
createTestUser();
