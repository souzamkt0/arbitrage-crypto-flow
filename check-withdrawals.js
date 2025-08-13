// Script para verificar saques pendentes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWithdrawals() {
  try {
    console.log('🔍 Verificando saques...');
    
    // Buscar saques pendentes
    const { data: pendingWithdrawals, error: pendingError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Erro ao buscar saques pendentes:', pendingError);
    } else {
      console.log('📋 Saques pendentes:', pendingWithdrawals.length);
      pendingWithdrawals.forEach((withdrawal, index) => {
        console.log(`\n${index + 1}. ID: ${withdrawal.id}`);
        console.log(`   Valor: R$ ${withdrawal.amount_brl}`);
        console.log(`   Usuário: ${withdrawal.user_id}`);
        console.log(`   PIX: ${withdrawal.pix_key} (${withdrawal.pix_key_type})`);
        console.log(`   Nome: ${withdrawal.holder_name}`);
        console.log(`   CPF: ${withdrawal.cpf}`);
        console.log(`   Criado: ${withdrawal.created_at}`);
      });
    }

    // Buscar todos os saques recentes
    const { data: allWithdrawals, error: allError } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Erro ao buscar todos os saques:', allError);
    } else {
      console.log('\n📋 Todos os saques recentes:');
      allWithdrawals.forEach((withdrawal, index) => {
        console.log(`\n${index + 1}. [${withdrawal.status}] ID: ${withdrawal.id}`);
        console.log(`   Valor: R$ ${withdrawal.amount_brl}`);
        console.log(`   PIX: ${withdrawal.pix_key} (${withdrawal.pix_key_type})`);
        console.log(`   Criado: ${withdrawal.created_at}`);
      });
    }

  } catch (error) {
    console.error('💥 Erro no script:', error);
  }
}

checkWithdrawals();