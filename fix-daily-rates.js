import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDailyRatesAndReferrals() {
  try {
    console.log('🔧 Corrigindo taxas diárias e requisitos de indicações...');
    
    // Atualizar Robô 4.0.0
    const { error: error1 } = await supabase
      .from('investment_plans')
      .update({
        daily_rate: 2.5,
        required_referrals: 0,
        contract_fee: 0,
        maximum_amount: 100
      })
      .ilike('name', '%4.0.0%');
    
    if (error1) {
      console.error('Erro ao atualizar Robô 4.0.0:', error1);
    } else {
      console.log('✅ Robô 4.0.0 atualizado: 2.5% diário, 0 indicações');
    }
    
    // Atualizar Robô 4.0.5
    const { error: error2 } = await supabase
      .from('investment_plans')
      .update({
        daily_rate: 3.0,
        required_referrals: 10,
        contract_fee: 10,
        maximum_amount: 200
      })
      .ilike('name', '%4.0.5%');
    
    if (error2) {
      console.error('Erro ao atualizar Robô 4.0.5:', error2);
    } else {
      console.log('✅ Robô 4.0.5 atualizado: 3.0% diário, 10 indicações, $10 taxa');
    }
    
    // Atualizar Robô 4.1.0
    const { error: error3 } = await supabase
      .from('investment_plans')
      .update({
        daily_rate: 4.0,
        required_referrals: 20,
        contract_fee: 10,
        maximum_amount: 5000
      })
      .ilike('name', '%4.1.0%');
    
    if (error3) {
      console.error('Erro ao atualizar Robô 4.1.0:', error3);
    } else {
      console.log('✅ Robô 4.1.0 atualizado: 4.0% diário, 20 indicações, $10 taxa');
    }
    
    // Verificar resultado
    console.log('\n🔍 Verificando planos atualizados...');
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .order('name');
    
    if (plansError) {
      console.error('❌ Erro ao verificar planos:', plansError);
      return;
    }
    
    if (plans && plans.length > 0) {
      console.log('\n📊 Planos corrigidos:');
      console.table(plans.map(plan => ({
        Nome: plan.name,
        'Taxa Diária': `${plan.daily_rate}%`,
        'Mín. USDT': `$${plan.minimum_amount}`,
        'Máx. USDT': `$${plan.maximum_amount}`,
        'Indicações': plan.required_referrals,
        'Taxa Contrato': `$${plan.contract_fee}`,
        Status: plan.status
      })));
    }
    
    console.log('\n✅ Correção concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
fixDailyRatesAndReferrals();