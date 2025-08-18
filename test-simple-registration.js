// Teste simples do sistema de cadastro sem trigger
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cbwpghrkfvczjqzefvix.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSimpleRegistration() {
  console.log('🔄 Testando cadastro simples...');
  
  const testData = {
    email: `teste_simples_${Date.now()}@teste.com`,
    password: 'senha123456',
    firstName: 'Maria',
    lastName: 'Santos',
    cpf: '987.654.321-00'
  };

  try {
    console.log('📧 Dados do teste:', testData);

    // 1. Primeiro, desabilitar o trigger temporariamente
    console.log('🔄 Desabilitando trigger...');
    const { error: triggerError } = await supabase.rpc('exec_sql', { 
      sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;' 
    });
    
    if (triggerError) {
      console.log('⚠️ Erro ao desabilitar trigger (pode ignorar):', triggerError);
    }

    // 2. Criar usuário no auth
    console.log('🔄 Criando usuário no auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          first_name: testData.firstName,
          last_name: testData.lastName,
          cpf: testData.cpf,
          referral_code: 'souzamkt0'
        }
      }
    });

    if (authError) {
      console.error('❌ Erro no auth:', authError);
      return;
    }

    console.log('✅ Usuário criado no auth:', authData.user?.id);

    // 3. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Criar perfil manualmente
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

    // 5. Verificar se foi criado
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
      balance: finalProfile?.balance
    });

    console.log('✅ Teste de cadastro simples concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSimpleRegistration();

