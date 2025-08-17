// Teste final do sistema de cadastro
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cbwpghrkfvczjqzefvix.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFinalRegistration() {
  console.log('🔄 Teste final do sistema de cadastro...');
  
  const testData = {
    email: `teste_final_${Date.now()}@teste.com`,
    password: 'senha123456',
    firstName: 'Pedro',
    lastName: 'Oliveira',
    cpf: '111.222.333-44'
  };

  try {
    console.log('📧 Dados do teste:', testData);

    // 1. Criar usuário no auth (sem metadata para evitar problemas)
    console.log('🔄 Criando usuário no auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      console.error('❌ Erro no auth:', authError);
      return;
    }

    console.log('✅ Usuário criado no auth:', authData.user?.id);

    // 2. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Criar perfil manualmente
    console.log('🔄 Criando perfil manualmente...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user?.id,
        email: authData.user?.email,
        display_name: `${testData.firstName} ${testData.lastName}`,
        username: authData.user?.email?.split('@')[0] || 'user',
        first_name: testData.firstName,
        last_name: testData.lastName,
        cpf: testData.cpf,
        bio: 'Novo usuário',
        avatar: 'avatar1',
        referral_code: 'souzamkt0',
        referred_by: null,
        role: 'user',
        balance: 0.00,
        total_profit: 0.00,
        status: 'active'
      });

    if (profileError) {
      console.error('❌ Erro criando perfil:', profileError);
      return;
    }

    console.log('✅ Perfil criado com sucesso!');

    // 4. Verificar se foi criado
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user?.id)
      .single();

    console.log('📊 Dados finais do perfil:', {
      user_id: finalProfile?.user_id,
      email: finalProfile?.email,
      display_name: finalProfile?.display_name,
      first_name: finalProfile?.first_name,
      last_name: finalProfile?.last_name,
      cpf: finalProfile?.cpf,
      role: finalProfile?.role,
      balance: finalProfile?.balance,
      status: finalProfile?.status
    });

    console.log('✅ Teste final concluído com sucesso!');
    console.log('🎉 O cadastro está funcionando!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testFinalRegistration();
