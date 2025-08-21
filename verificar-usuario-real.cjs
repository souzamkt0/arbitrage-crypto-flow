const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarUsuarioReal() {
  console.log('🔍 Verificando usuário real...\n');

  try {
    // 1. Buscar um usuário real da tabela profiles
    console.log('👤 1. Buscando usuário real...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, username')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Profiles encontrados: ${profiles?.length || 0}`);
      if (profiles && profiles.length > 0) {
        console.log('📝 Usuários disponíveis:');
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.user_id} - ${profile.email} (${profile.username})`);
        });
        
        // Usar o primeiro usuário para teste
        const testUserId = profiles[0].user_id;
        console.log(`\n🎯 Usando usuário para teste: ${testUserId}`);
        
        // 2. Testar inserção com usuário real
        console.log('\n🧪 2. Testando inserção com usuário real...');
        
        const testTransaction = {
          user_id: testUserId,
          trx_id: 'TEST-TRX-' + Date.now(),
          type: 'deposit',
          amount: 5.85,
          amount_brl: 5.85,
          status: 'pending',
          pix_code: 'test-pix-code',
          qr_code_base64: 'test-qr-code',
          person_name: 'Test User',
          person_cpf: '12345678909',
          gateway_response: { test: true }
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('digitopay_transactions')
          .insert(testTransaction)
          .select();

        if (insertError) {
          console.error('❌ Erro ao inserir transação de teste:', insertError);
        } else {
          console.log('✅ Transação de teste inserida com sucesso:', insertResult);
          
          // Limpar o teste
          await supabase
            .from('digitopay_transactions')
            .delete()
            .eq('trx_id', testTransaction.trx_id);
          
          console.log('🧹 Transação de teste removida');
        }
        
        // 3. Atualizar o script de teste
        console.log('\n📝 3. Atualizando script de teste...');
        console.log(`\n💡 Use este userId no teste: ${testUserId}`);
        
      } else {
        console.log('❌ NENHUM PROFILE ENCONTRADO!');
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarUsuarioReal();
