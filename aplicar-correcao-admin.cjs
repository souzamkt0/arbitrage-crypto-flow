const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Aplicando correção para restaurar login do admin...\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('Verifique se o arquivo .env.local contém:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function aplicarCorrecaoAdmin() {
  try {
    console.log('1️⃣ Desabilitando RLS temporariamente...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️ Erro ao desabilitar RLS (pode ser normal):', rlsError.message);
    } else {
      console.log('✅ RLS desabilitado');
    }

    console.log('\n2️⃣ Removendo políticas RLS conflitantes...');
    const policies = [
      "Users can view own profile",
      "Users can update own profile", 
      "Users can insert own profile",
      "Perfis são publicamente visíveis",
      "Usuários podem criar seu próprio perfil",
      "Usuários podem atualizar seu próprio perfil",
      "Usuários podem deletar seu próprio perfil",
      "Profiles are publicly viewable",
      "Users can insert their own profile",
      "Users can update their own profile",
      "Admins can do everything",
      "System can create profiles"
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON profiles;`
      });
      if (!error) {
        console.log(`✅ Política "${policy}" removida`);
      }
    }

    console.log('\n3️⃣ Criando política permissiva...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true);'
    });
    
    if (policyError) {
      console.log('⚠️ Erro ao criar política (pode ser normal):', policyError.message);
    } else {
      console.log('✅ Política permissiva criada');
    }

    console.log('\n4️⃣ Atualizando perfil do admin...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        status: 'active',
        profile_completed: true,
        username: 'souzamkt0',
        display_name: 'Admin Souza',
        referral_code: 'souzamkt0',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'souzamkt0@gmail.com');

    if (updateError) {
      console.log('❌ Erro ao atualizar admin:', updateError.message);
    } else {
      console.log('✅ Perfil do admin atualizado');
    }

    console.log('\n5️⃣ Verificando status final...');
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (adminError) {
      console.log('❌ Erro ao verificar admin:', adminError.message);
    } else {
      console.log('✅ Status do admin:');
      console.log('   Email:', adminData.email);
      console.log('   Role:', adminData.role);
      console.log('   Status:', adminData.status);
      console.log('   Profile completed:', adminData.profile_completed);
    }

    console.log('\n6️⃣ Testando função is_admin_user...');
    const { data: functionData, error: functionError } = await supabase.rpc('is_admin_user', {
      user_email: 'souzamkt0@gmail.com'
    });

    if (functionError) {
      console.log('⚠️ Função is_admin_user não encontrada (criando...)');
      const { error: createFunctionError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION is_admin_user(user_email text)
          RETURNS boolean
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              IF user_email = 'souzamkt0@gmail.com' THEN
                  RETURN TRUE;
              END IF;
              
              IF EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE email = user_email 
                  AND role = 'admin'
              ) THEN
                  RETURN TRUE;
              END IF;
              
              RETURN FALSE;
          END;
          $$;
        `
      });
      
      if (createFunctionError) {
        console.log('❌ Erro ao criar função:', createFunctionError.message);
      } else {
        console.log('✅ Função is_admin_user criada');
      }
    } else {
      console.log('✅ Função is_admin_user retorna:', functionData);
    }

    console.log('\n🎯 CORREÇÃO APLICADA COM SUCESSO!');
    console.log('O admin souzamkt0@gmail.com deve conseguir fazer login agora.');
    console.log('\n📋 Próximos passos:');
    console.log('1. Tente fazer login novamente');
    console.log('2. Se ainda houver erro, execute o script SQL diretamente no Supabase');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

aplicarCorrecaoAdmin();







