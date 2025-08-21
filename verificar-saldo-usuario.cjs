const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSaldoUsuario() {
  console.log('🔍 Verificando saldo do usuário...\n');

  try {
    // Buscar todos os usuários com seus saldos
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, email, username, balance, referral_balance, total_profit')
      .order('balance', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar perfis:', error);
      return;
    }

    console.log('📊 Top 10 usuários por saldo:');
    console.log('='.repeat(80));
    
    profiles.forEach((profile, index) => {
      const totalBalance = (profile.balance || 0) + (profile.referral_balance || 0);
      console.log(`${index + 1}. ${profile.email || profile.username || 'N/A'}`);
      console.log(`   ID: ${profile.user_id}`);
      console.log(`   Saldo Principal: R$ ${(profile.balance || 0).toFixed(2)}`);
      console.log(`   Saldo Indicação: R$ ${(profile.referral_balance || 0).toFixed(2)}`);
      console.log(`   Total Profit: R$ ${(profile.total_profit || 0).toFixed(2)}`);
      console.log(`   SALDO TOTAL: R$ ${totalBalance.toFixed(2)}`);
      console.log('-'.repeat(40));
    });

    // Verificar se há algum usuário com saldo zero que deveria ter saldo
    console.log('\n🔍 Verificando usuários com saldo zero...');
    const { data: zeroBalanceUsers, error: zeroError } = await supabase
      .from('profiles')
      .select('user_id, email, username, balance, referral_balance')
      .or('balance.gt.0,referral_balance.gt.0')
      .order('balance', { ascending: false });

    if (zeroError) {
      console.error('❌ Erro ao buscar usuários com saldo:', zeroError);
      return;
    }

    console.log(`✅ Encontrados ${zeroBalanceUsers.length} usuários com saldo > 0`);

    // Verificar depósitos recentes
    console.log('\n💰 Verificando depósitos recentes...');
    const { data: recentDeposits, error: depositsError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (depositsError) {
      console.error('❌ Erro ao buscar depósitos:', depositsError);
    } else {
      console.log('📈 Últimos 5 depósitos completados:');
      recentDeposits.forEach((deposit, index) => {
        console.log(`${index + 1}. ID: ${deposit.trx_id}`);
        console.log(`   Usuário: ${deposit.user_id}`);
        console.log(`   Valor: R$ ${deposit.amount_brl?.toFixed(2) || 'N/A'}`);
        console.log(`   Status: ${deposit.status}`);
        console.log(`   Data: ${new Date(deposit.created_at).toLocaleString()}`);
        console.log('-'.repeat(30));
      });
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

verificarSaldoUsuario();
