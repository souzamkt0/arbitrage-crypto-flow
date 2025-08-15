import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlansSync() {
  console.log('🔍 Verificando sincronização dos planos de investimento...');
  
  try {
    // Buscar todos os planos
    const { data: allPlans, error: allError } = await supabase
      .from('investment_plans')
      .select('*')
      .order('name');
    
    if (allError) {
      console.error('❌ Erro ao buscar planos:', allError);
      return;
    }
    
    console.log(`\n📊 Total de planos na tabela: ${allPlans?.length || 0}`);
    
    if (allPlans && allPlans.length > 0) {
      console.log('\n📋 Lista de todos os planos:');
      allPlans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name}`);
        console.log(`   - Taxa diária: ${plan.daily_rate}%`);
        console.log(`   - Valor: R$ ${plan.minimum_amount} - R$ ${plan.max_investment_amount}`);
        console.log(`   - Duração: ${plan.duration_days} dias`);
        console.log(`   - Status: ${plan.status}`);
        console.log(`   - ID: ${plan.id}`);
        console.log('');
      });
    }
    
    // Buscar apenas planos ativos
    const { data: activePlans, error: activeError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (activeError) {
      console.error('❌ Erro ao buscar planos ativos:', activeError);
      return;
    }
    
    console.log(`\n✅ Planos ativos: ${activePlans?.length || 0}`);
    
    if (activePlans && activePlans.length > 0) {
      console.log('\n🟢 Planos ativos disponíveis:');
      activePlans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name} - ${plan.daily_rate}% - R$ ${plan.minimum_amount}-${plan.max_investment_amount}`);
      });
    }
    
    // Verificar se há planos inativos
    const inactivePlans = allPlans?.filter(plan => plan.status !== 'active') || [];
    if (inactivePlans.length > 0) {
      console.log(`\n🔴 Planos inativos: ${inactivePlans.length}`);
      inactivePlans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name} - Status: ${plan.status}`);
      });
    }
    
    console.log('\n🏁 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPlansSync();