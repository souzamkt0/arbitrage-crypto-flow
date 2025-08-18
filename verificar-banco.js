// Script para verificar o status do banco de dados
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarBanco() {
  try {
    console.log('🔍 === VERIFICANDO BANCO DE DADOS ===');
    
    // 1. Verificar se conseguimos conectar
    console.log('1️⃣ Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError.message);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 2. Verificar estrutura da tabela profiles
    console.log('2️⃣ Verificando estrutura da tabela profiles...');
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
      console.log('📊 Colunas disponíveis:', Object.keys(profiles[0]));
      
      // Verificar colunas específicas
      const profile = profiles[0];
      const colunasNecessarias = [
        'user_id', 'email', 'display_name', 'username', 
        'first_name', 'last_name', 'cpf', 'whatsapp', 
        'bio', 'avatar', 'referral_code', 'referred_by',
        'role', 'balance', 'total_profit', 'status', 'profile_completed'
      ];
      
      console.log('🔍 Verificando colunas necessárias:');
      colunasNecessarias.forEach(coluna => {
        if (profile.hasOwnProperty(coluna)) {
          console.log(`✅ ${coluna}: ${typeof profile[coluna]} (${profile[coluna]})`);
        } else {
          console.log(`❌ ${coluna}: NÃO ENCONTRADA`);
        }
      });
    } else {
      console.log('⚠️ Tabela profiles vazia ou não encontrada');
    }
    
    // 3. Verificar usuários existentes
    console.log('3️⃣ Verificando usuários existentes...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, email, username, role, status')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log(`✅ Encontrados ${users.length} usuários:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.username}) - ${user.role} - ${user.status}`);
      });
    }
    
    // 4. Testar criação de usuário simples
    console.log('4️⃣ Testando criação de usuário...');
    const timestamp = Date.now();
    const testUser = {
      user_id: `test-${timestamp}`,
      email: `teste${timestamp}@teste.com`,
      username: `teste${timestamp}`,
      role: 'user',
      status: 'active',
      profile_completed: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário teste:', insertError.message);
      console.error('❌ Detalhes:', insertError);
    } else {
      console.log('✅ Usuário teste inserido com sucesso!');
      console.log('📊 Dados inseridos:', insertData);
      
      // Limpar usuário teste
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', testUser.user_id);
      
      if (deleteError) {
        console.error('⚠️ Erro ao limpar usuário teste:', deleteError.message);
      } else {
        console.log('🗑️ Usuário teste removido');
      }
    }
    
    console.log('🎉 === VERIFICAÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarBanco();
