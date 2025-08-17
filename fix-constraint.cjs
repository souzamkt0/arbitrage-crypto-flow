const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixConstraint() {
  console.log('🔧 Corrigindo constraint da coluna role...');
  
  try {
    // 1. Verificar constraint atual
    console.log('\n📋 Verificando constraint atual...');
    const { data: currentConstraint, error: constraintError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('table_name', 'profiles')
      .like('constraint_name', '%role%');
    
    if (constraintError) {
      console.log('❌ Erro ao verificar constraint:', constraintError);
    } else {
      console.log('📊 Constraint atual:', currentConstraint);
    }

    // 2. Tentar update direto para ver o erro
    console.log('\n🔄 Testando update direto...');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'partner' })
      .eq('email', 'souzamkt0@gmail.com')
      .select();
    
    if (updateError) {
      console.log('❌ Erro no update:', updateError);
      console.log('📋 Detalhes do erro:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
    } else {
      console.log('✅ Update funcionou:', updateResult);
    }

    // 3. Tentar cadastro de teste
    console.log('\n🧪 Testando cadastro...');
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
      console.log('❌ Erro no cadastro:', authError);
      console.log('📋 Detalhes do erro:', {
        message: authError.message,
        status: authError.status,
        code: authError.code
      });
    } else {
      console.log('✅ Cadastro realizado:', authData);
      
      // Verificar se o perfil foi criado
      setTimeout(async () => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, email, role, display_name')
          .eq('email', testEmail)
          .single();
        
        if (profileError) {
          console.log('❌ Erro ao verificar perfil:', profileError);
        } else {
          console.log('✅ Perfil criado:', profileData);
        }
      }, 2000);
    }

    // 4. Verificar sócios após correção
    console.log('\n👥 Verificando sócios...');
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

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a correção
fixConstraint();

