const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnosticSchemaError() {
  console.log('🔍 DIAGNÓSTICO: "Database error querying schema"');
  console.log('=' .repeat(60));

  try {
    // 1. Testar conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro na conexão básica:', testError.message);
    } else {
      console.log('✅ Conexão básica: OK');
    }

    // 2. Testar login específico
    console.log('\n2️⃣ Testando login (causa do erro)...');
    const testEmail = 'test-schema@example.com';
    const testPassword = 'test123456';
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      console.log('❌ Erro no login:', authError.message);
      console.log('📋 Tipo de erro:', authError.name);
      console.log('🔍 Código:', authError.status);
    } else {
      console.log('✅ Login funcionou (usuário existe)');
    }

    // 3. Testar signup (outra causa comum)
    console.log('\n3️⃣ Testando signup...');
    const signupEmail = `test-signup-${Date.now()}@example.com`;
    const signupPassword = 'test123456';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword
    });

    if (signupError) {
      console.log('❌ Erro no signup:', signupError.message);
      console.log('📋 Tipo de erro:', signupError.name);
    } else {
      console.log('✅ Signup funcionou');
    }

    // 4. Verificar estrutura da tabela profiles
    console.log('\n4️⃣ Verificando estrutura da tabela profiles...');
    const { data: structureData, error: structureError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.log('❌ Erro ao verificar estrutura:', structureError.message);
    } else {
      console.log('✅ Estrutura da tabela: OK');
      if (structureData && structureData.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(structureData[0]));
      }
    }

    // 5. Verificar RLS (Row Level Security)
    console.log('\n5️⃣ Verificando RLS...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (rlsError) {
      console.log('❌ Erro ao verificar RLS:', rlsError.message);
    } else {
      console.log('📋 Status RLS:', rlsData);
    }

    // 6. Verificar políticas RLS
    console.log('\n6️⃣ Verificando políticas RLS...');
    const { data: policiesData, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, permissive, roles, cmd')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (policiesError) {
      console.log('❌ Erro ao verificar políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas encontradas:', policiesData?.length || 0);
      policiesData?.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    }

    // 7. Verificar triggers
    console.log('\n7️⃣ Verificando triggers...');
    const { data: triggersData, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (triggersError) {
      console.log('❌ Erro ao verificar triggers:', triggersError.message);
    } else {
      console.log('📋 Triggers encontrados:', triggersData?.length || 0);
      triggersData?.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
      });
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 DIAGNÓSTICO COMPLETO');
    console.log('=' .repeat(60));
    
    // Análise final
    if (authError && authError.message.includes('Database error querying schema')) {
      console.log('🚨 PROBLEMA IDENTIFICADO:');
      console.log('   O erro "Database error querying schema" indica:');
      console.log('   1. Problemas com RLS (Row Level Security)');
      console.log('   2. Triggers corrompidos');
      console.log('   3. Políticas de segurança conflitantes');
      console.log('   4. Schema de autenticação corrompido');
      
      console.log('\n🔧 SOLUÇÃO RECOMENDADA:');
      console.log('   Execute este SQL no painel Supabase:');
      console.log('   https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/sql');
      console.log('');
      console.log('   -- SQL DE CORREÇÃO:');
      console.log('   -- 1. Desabilitar RLS temporariamente');
      console.log('   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('   -- 2. Remover políticas conflitantes');
      console.log('   DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;');
      console.log('   DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;');
      console.log('   DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;');
      console.log('   DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;');
      console.log('');
      console.log('   -- 3. Remover triggers problemáticos');
      console.log('   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
      console.log('   DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;');
      console.log('');
      console.log('   -- 4. Criar trigger simples');
      console.log('   CREATE OR REPLACE FUNCTION public.handle_new_user()');
      console.log('   RETURNS TRIGGER AS $$');
      console.log('   BEGIN');
      console.log('     INSERT INTO public.profiles (user_id, email, username, role, status)');
      console.log('     VALUES (NEW.id, NEW.email, split_part(NEW.email, \'@\', 1), \'user\', \'active\');');
      console.log('     RETURN NEW;');
      console.log('   END;');
      console.log('   $$ LANGUAGE plpgsql SECURITY DEFINER;');
      console.log('');
      console.log('   CREATE TRIGGER on_auth_user_created');
      console.log('     AFTER INSERT ON auth.users');
      console.log('     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();');
      console.log('');
      console.log('   -- 5. Verificar se funcionou');
      console.log('   SELECT COUNT(*) FROM public.profiles;');
    } else {
      console.log('✅ Sistema parece estar funcionando corretamente');
      console.log('   O erro pode ser específico de algum usuário ou configuração');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

diagnosticSchemaError();

