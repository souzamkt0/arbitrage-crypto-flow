const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZmZ2Y3pqcXplZnZpeCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzI5NzI5LCJleHAiOjIwNTAzMDU3Mjl9.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q';

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

    // Teste 2: Verificar constraint da coluna role
    console.log('\n🔒 Teste 2: Verificando constraint da coluna role...');
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'profiles' });
    
    if (constraintError) {
      console.log('❌ Erro ao verificar constraints:', constraintError);
    } else {
      console.log('✅ Constraints verificadas:', constraintData);
    }

    // Teste 3: Verificar se Admin Souza existe e qual seu role
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

    // Teste 6: Tentar atualizar Admin Souza para partner
    console.log('\n🔄 Teste 6: Tentando atualizar Admin Souza para partner...');
    if (adminSouza) {
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'partner' })
        .eq('user_id', adminSouza.user_id)
        .select();
      
      if (updateError) {
        console.log('❌ Erro ao atualizar role:', updateError);
        console.log('📋 Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
      } else {
        console.log('✅ Role atualizado com sucesso:', updateData);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testSupabaseConnection();


