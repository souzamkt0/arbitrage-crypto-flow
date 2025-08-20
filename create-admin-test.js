import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cbwpghrkfvczjqzefvix.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminTest() {
  const timestamp = Date.now();
  
  const adminData = {
    firstName: 'Admin',
    lastName: 'Master',
    username: `admin_master_${timestamp}`,
    email: `admin_master_${timestamp}@gmail.com`,
    password: 'AdminMaster123!',
    cpf: '111.222.333-44',
    whatsapp: '(11) 98888-7777'
  };

  try {
    console.log('🚀 === CRIANDO ADMIN DE TESTE ===');
    console.log('📊 Dados do Admin:', adminData);
    
    // 1. CRIAR USUÁRIO NO AUTH
    console.log('🔄 Etapa 1: Criando admin no auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          username: adminData.username,
          cpf: adminData.cpf,
          whatsapp: adminData.whatsapp
        },
        emailRedirectTo: `${window.location?.origin || 'http://localhost:3000'}/dashboard`
      }
    });

    if (authError) {
      throw new Error(`Erro no auth: ${authError.message}`);
    }

    const userId = authData.user?.id;
    console.log('✅ Admin criado no auth:', userId);

    // 2. CRIAR PERFIL ADMIN VIA RPC
    console.log('🔄 Etapa 2: Criando perfil admin via RPC...');
    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile_manual', {
      user_id_param: userId,
      email_param: adminData.email,
      first_name_param: adminData.firstName,
      last_name_param: adminData.lastName,
      username_param: adminData.username,
      cpf_param: adminData.cpf,
      whatsapp_param: adminData.whatsapp,
      referral_code_param: null
    });

    if (profileError) {
      throw new Error(`Erro ao criar perfil admin: ${profileError.message}`);
    }

    if (!profileResult?.success) {
      throw new Error(`Falha na criação do perfil admin: ${profileResult?.error}`);
    }

    console.log('✅ Perfil admin criado via RPC:', profileResult);

    // 3. DEFINIR COMO ADMIN
    console.log('🔄 Etapa 3: Definindo role como admin...');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        status: 'active',
        profile_completed: true
      })
      .eq('user_id', userId);

    if (updateError) {
      console.warn('⚠️ Aviso ao definir como admin:', updateError);
    } else {
      console.log('✅ Role admin definido:', updateResult);
    }

    // 4. CONFIRMAR EMAIL
    console.log('🔄 Etapa 4: Confirmando email...');
    const { data: confirmResult, error: confirmError } = await supabase.rpc('confirm_email_manual', {
      user_email: adminData.email
    });

    if (confirmError) {
      console.warn('⚠️ Aviso ao confirmar email:', confirmError);
    } else {
      console.log('✅ Email confirmado:', confirmResult);
    }

    // 5. VERIFICAR PERFIL ADMIN CRIADO
    console.log('🔍 Etapa 5: Verificando perfil admin criado...');
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileCheckError) {
      console.warn('⚠️ Aviso ao buscar perfil admin:', profileCheckError);
    } else {
      console.log('✅ Perfil admin encontrado:', profile);
    }

    // 6. TESTAR LOGIN ADMIN
    console.log('🔄 Etapa 6: Testando login admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminData.email,
      password: adminData.password
    });

    if (loginError) {
      throw new Error(`Erro no login admin: ${loginError.message}`);
    }

    console.log('✅ Login admin funcionando:', loginData.user?.email);

    // Fazer logout
    await supabase.auth.signOut();
    console.log('📤 Logout admin realizado');

    // RESULTADO FINAL
    console.log('🎉 === ADMIN DE TESTE CRIADO COM SUCESSO ===');
    console.log('📋 DADOS PARA LOGIN:');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔐 Senha: ${adminData.password}`);
    console.log(`👤 Username: ${adminData.username}`);
    console.log(`🛡️ Role: admin`);
    console.log('=====================================');

    return {
      success: true,
      adminData,
      message: 'Admin de teste criado com sucesso!'
    };

  } catch (error) {
    console.error('💥 ERRO AO CRIAR ADMIN DE TESTE:', error);
    return {
      success: false,
      error: error.message,
      adminData
    };
  }
}

// Executar o teste
createAdminTest().then(result => {
  if (result.success) {
    alert(`✅ ADMIN CRIADO!\n\nEmail: ${result.adminData.email}\nSenha: ${result.adminData.password}\nUsername: ${result.adminData.username}\n\nAgora você pode testar o login!`);
  } else {
    alert(`❌ ERRO: ${result.error}`);
  }
});