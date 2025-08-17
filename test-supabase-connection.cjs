const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  console.log('📡 URL:', SUPABASE_URL);
  
  try {
    // Teste 1: Verificar se a tabela profiles existe
    console.log('\n📊 Teste 1: Verificando tabela profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erro ao acessar profiles:', profilesError);
    } else {
      console.log('✅ Tabela profiles acessível');
      console.log('📋 Estrutura da resposta:', profilesData);
    }

    // Teste 2: Verificar se as funções RPC existem
    console.log('\n⚙️ Teste 2: Verificando funções RPC...');
    
    // Testar get_table_policies
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' });
    
    if (policiesError) {
      console.log('❌ Erro na função get_table_policies:', policiesError);
    } else {
      console.log('✅ Função get_table_policies funciona:', policiesData);
    }

    // Testar check_rls_status
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'profiles' });
    
    if (rlsError) {
      console.log('❌ Erro na função check_rls_status:', rlsError);
    } else {
      console.log('✅ Função check_rls_status funciona:', rlsData);
    }

    // Testar exec_sql
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT 1 as test' });
    
    if (sqlError) {
      console.log('❌ Erro na função exec_sql:', sqlError);
    } else {
      console.log('✅ Função exec_sql funciona:', sqlData);
    }

    // Teste 3: Verificar se Admin Souza existe
    console.log('\n👤 Teste 3: Verificando Admin Souza...');
    const { data: adminSouza, error: adminError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('email', 'souzamkt0@gmail.com')
      .single();
    
    if (adminError) {
      console.log('❌ Erro ao buscar Admin Souza:', adminError);
    } else {
      console.log('✅ Admin Souza encontrado:', adminSouza);
      console.log('🏷️ Role atual:', adminSouza.role);
    }

    // Teste 4: Verificar se a função update_user_role existe
    console.log('\n⚙️ Teste 4: Verificando função update_user_role...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('update_user_role', { 
        user_id_param: adminSouza?.user_id || '00000000-0000-0000-0000-000000000000',
        new_role: 'partner'
      });
    
    if (functionError) {
      console.log('❌ Erro ao testar função update_user_role:', functionError);
    } else {
      console.log('✅ Função update_user_role funciona:', functionData);
    }

    // Teste 5: Verificar sócios
    console.log('\n👥 Teste 5: Verificando sócios...');
    const { data: partners, error: partnersError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('role', 'partner');
    
    if (partnersError) {
      console.log('❌ Erro ao buscar sócios:', partnersError);
    } else {
      console.log('✅ Sócios encontrados:', partners);
      console.log('📊 Quantidade de sócios:', partners?.length || 0);
    }

    // Teste 6: Verificar constraint da coluna role
    console.log('\n🔒 Teste 6: Verificando constraint da coluna role...');
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            constraint_name,
            check_clause
          FROM information_schema.check_constraints 
          WHERE table_name = 'profiles' 
          AND constraint_name LIKE '%role%'
        `
      });
    
    if (constraintError) {
      console.log('❌ Erro ao verificar constraint:', constraintError);
    } else {
      console.log('✅ Constraint encontrada:', constraintData);
    }

    // Teste 7: Tentar cadastro de teste
    console.log('\n🧪 Teste 7: Testando cadastro...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          referral_code: 'souzamkt0'
        }
      }
    });
    
    if (authError) {
      console.log('❌ Erro no cadastro de teste:', authError);
    } else {
      console.log('✅ Cadastro de teste realizado:', authData);
      
      // Verificar se o perfil foi criado
      setTimeout(async () => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, email, role, display_name')
          .eq('email', testEmail)
          .single();
        
        if (profileError) {
          console.log('❌ Erro ao verificar perfil criado:', profileError);
        } else {
          console.log('✅ Perfil criado automaticamente:', profileData);
        }
      }, 2000);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testSupabaseConnection();
