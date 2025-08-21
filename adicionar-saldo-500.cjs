const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function adicionarSaldo500() {
  console.log('💰 Adicionando R$ 500 ao saldo do usuário admin@clean.com...\n');

  try {
    // 1. Buscar o usuário admin@clean.com
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('user_id, email, balance, referral_balance, total_profit')
      .eq('email', 'admin@clean.com')
      .single();

    if (findError) {
      console.error('❌ Erro ao buscar usuário:', findError);
      return;
    }

    if (!profile) {
      console.error('❌ Usuário admin@clean.com não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   ID: ${profile.user_id}`);
    console.log(`   Saldo atual: R$ ${(profile.balance || 0).toFixed(2)}`);
    console.log(`   Saldo indicação: R$ ${(profile.referral_balance || 0).toFixed(2)}`);
    console.log(`   Total profit: R$ ${(profile.total_profit || 0).toFixed(2)}`);

    // 2. Calcular novo saldo
    const saldoAtual = profile.balance || 0;
    const novoSaldo = saldoAtual + 500;

    console.log(`\n💰 Adicionando R$ 500.00...`);
    console.log(`   Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`   Novo saldo: R$ ${novoSaldo.toFixed(2)}`);

    // 3. Atualizar o saldo
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        balance: novoSaldo,
        total_profit: (profile.total_profit || 0) + 500
      })
      .eq('user_id', profile.user_id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar saldo:', updateError);
      return;
    }

    console.log('\n✅ Saldo atualizado com sucesso!');
    console.log('📊 Novo status:');
    console.log(`   Saldo Principal: R$ ${novoSaldo.toFixed(2)}`);
    console.log(`   Total Profit: R$ ${((profile.total_profit || 0) + 500).toFixed(2)}`);

    // 4. Verificar se a atualização foi aplicada
    console.log('\n🔍 Verificando atualização...');
    const { data: verificacao, error: verifyError } = await supabase
      .from('profiles')
      .select('balance, total_profit')
      .eq('user_id', profile.user_id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError);
    } else {
      console.log('✅ Verificação concluída:');
      console.log(`   Saldo confirmado: R$ ${(verificacao.balance || 0).toFixed(2)}`);
      console.log(`   Total profit confirmado: R$ ${(verificacao.total_profit || 0).toFixed(2)}`);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

adicionarSaldo500();
