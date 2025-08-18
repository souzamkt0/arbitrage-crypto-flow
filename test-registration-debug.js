// Script para debugar problemas de registro
import { createClient } from '@supabase/supabase-js';

// Configuração da Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRegistration() {
  try {
    console.log('🔍 === DEBUG REGISTRO ===');
    console.log('📡 URL:', supabaseUrl);
    console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
    
    // 1. Testar conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError.message);
      console.error('❌ Código:', testError.code);
      console.error('❌ Detalhes:', testError.details);
      return;
    }
    
    console.log('✅ Conexão estabelecida!');
    
    // 2. Verificar estrutura da tabela
    console.log('\n2️⃣ Verificando estrutura da tabela...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao verificar profiles:', profilesError.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Tabela profiles encontrada!');
      console.log('📊 Colunas:', Object.keys(profiles[0]));
      
      // Verificar colunas específicas
      const profile = profiles[0];
      const colunasNecessarias = [
        'user_id', 'email', 'username', 'profile_completed',
        'first_name', 'last_name', 'cpf', 'whatsapp',
        'referral_code', 'referred_by', 'role', 'balance', 'total_profit', 'status'
      ];
      
      console.log('🔍 Verificando colunas necessárias:');
      colunasNecessarias.forEach(coluna => {
        if (profile.hasOwnProperty(coluna)) {
          console.log(`   ✅ ${coluna}: ${typeof profile[coluna]} (${profile[coluna]})`);
        } else {
          console.log(`   ❌ ${coluna}: NÃO ENCONTRADA`);
        }
      });
    } else {
      console.log('⚠️ Tabela profiles vazia');
    }
    
    // 3. Testar criação de usuário no auth
    console.log('\n3️⃣ Testando criação de usuário no auth...');
    const timestamp = Date.now();
    const testUser = {
      email: `teste${timestamp}@debug.com`,
      password: '123456'
    };
    
    console.log('📝 Dados do teste:', testUser);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        emailRedirectTo: 'http://localhost:8080/dashboard',
        data: {
          email_confirmed: true
        }
      }
    });
    
    if (authError) {
      console.error('❌ Erro no auth:', authError.message);
      console.error('❌ Código:', authError.code);
      console.error('❌ Status:', authError.status);
      return;
    }
    
    console.log('✅ Usuário criado no auth:', authData.user.id);
    
    // 4. Aguardar um pouco
    console.log('\n4️⃣ Aguardando 1 segundo...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Testar criação de perfil
    console.log('\n5️⃣ Testando criação de perfil...');
    const generateReferralCode = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `teste${timestamp}${random}`.toLowerCase();
    };
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: authData.user.email,
        display_name: null,
        username: `teste${timestamp}`,
        first_name: null,
        last_name: null,
        cpf: null,
        whatsapp: null,
        bio: null,
        avatar: 'avatar1',
        referral_code: generateReferralCode(),
        referred_by: null,
        role: 'user',
        balance: 0.00,
        total_profit: 0.00,
        status: 'active',
        profile_completed: false
      });
    
    if (profileError) {
      console.error('❌ Erro criando perfil:', profileError.message);
      console.error('❌ Código:', profileError.code);
      console.error('❌ Detalhes:', profileError.details);
      console.error('❌ Hint:', profileError.hint);
      
      // Tentar deletar o usuário criado
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('🗑️ Usuário deletado após erro no perfil');
      } catch (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError.message);
      }
      return;
    }
    
    console.log('✅ Perfil criado com sucesso!');
    
    // 6. Confirmar email automaticamente
    console.log('\n6️⃣ Confirmando email automaticamente...');
    try {
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.error('❌ Erro ao confirmar email:', confirmError.message);
      } else {
        console.log('✅ Email confirmado automaticamente!');
      }
    } catch (confirmError) {
      console.error('❌ Erro ao confirmar email:', confirmError.message);
    }
    
    // 7. Testar login
    console.log('\n7️⃣ Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login realizado com sucesso!');
    }
    
    // 8. Limpar usuário teste
    console.log('\n8️⃣ Limpando usuário teste...');
    try {
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('🗑️ Usuário teste removido');
    } catch (deleteError) {
      console.error('⚠️ Erro ao remover usuário teste:', deleteError.message);
    }
    
    console.log('\n🎉 === DEBUG CONCLUÍDO ===');
    console.log('✅ Sistema de registro funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Executar debug
console.log('🚀 Iniciando debug de registro...');
debugRegistration();
