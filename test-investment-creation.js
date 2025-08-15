import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testInvestmentCreation() {
  console.log('🔍 Testando criação de investimento...');
  
  try {
    // 1. Verificar se há usuários na tabela profiles
    console.log('\n1. Verificando usuários disponíveis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, balance')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ Nenhum usuário encontrado na tabela profiles');
      return;
    }
    
    const testUser = profiles[0];
    console.log('✅ Usuário de teste encontrado:', testUser.user_id);
    console.log('💰 Saldo atual:', testUser.balance);
    
    // 2. Verificar planos de investimento disponíveis
    console.log('\n2. Verificando planos de investimento...');
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active')
      .limit(1);
    
    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
      return;
    }
    
    if (!plans || plans.length === 0) {
      console.log('❌ Nenhum plano ativo encontrado');
      return;
    }
    
    const testPlan = plans[0];
    console.log('✅ Plano de teste encontrado:', testPlan.name);
    console.log('📊 Detalhes do plano:', {
      id: testPlan.id,
      name: testPlan.name,
      daily_rate: testPlan.daily_rate,
      minimum_amount: testPlan.minimum_amount,
      max_investment_amount: testPlan.max_investment_amount,
      duration_days: testPlan.duration_days
    });
    
    // 3. Tentar criar um investimento de teste
    console.log('\n3. Tentando criar investimento...');
    const investmentAmount = testPlan.minimum_amount;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (testPlan.duration_days * 24 * 60 * 60 * 1000));
    const dailyTarget = (investmentAmount * testPlan.daily_rate) / 100;
    
    console.log('📋 Dados do investimento:', {
      user_id: testUser.user_id,
      investment_plan_id: testPlan.id,
      amount: investmentAmount,
      daily_rate: testPlan.daily_rate,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      days_remaining: testPlan.duration_days,
      daily_target: dailyTarget
    });
    
    const { data: newInvestment, error: investmentError } = await supabase
      .from('user_investments')
      .insert({
        user_id: testUser.user_id,
        investment_plan_id: testPlan.id,
        amount: investmentAmount,
        daily_rate: testPlan.daily_rate,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        days_remaining: testPlan.duration_days,
        daily_target: dailyTarget,
        total_operations: 30
      })
      .select()
      .single();
    
    if (investmentError) {
      console.error('❌ ERRO AO CRIAR INVESTIMENTO:');
      console.error('Código:', investmentError.code);
      console.error('Mensagem:', investmentError.message);
      console.error('Detalhes:', investmentError.details);
      console.error('Hint:', investmentError.hint);
      console.error('Objeto completo:', JSON.stringify(investmentError, null, 2));
      return;
    }
    
    console.log('✅ Investimento criado com sucesso!');
    console.log('📊 Dados do investimento criado:', newInvestment);
    
    // 4. Limpar o investimento de teste
    console.log('\n4. Limpando investimento de teste...');
    const { error: deleteError } = await supabase
      .from('user_investments')
      .delete()
      .eq('id', newInvestment.id);
    
    if (deleteError) {
      console.error('⚠️ Erro ao deletar investimento de teste:', deleteError);
    } else {
      console.log('✅ Investimento de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Verificar estrutura da tabela user_investments
async function checkTableStructure() {
  console.log('\n🔍 Verificando estrutura da tabela user_investments...');
  
  try {
    const { data, error } = await supabase
      .from('user_investments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela user_investments:', error);
      return;
    }
    
    console.log('✅ Tabela user_investments acessível');
    if (data && data.length > 0) {
      console.log('📋 Campos disponíveis:', Object.keys(data[0]));
    } else {
      console.log('📋 Tabela vazia, mas acessível');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
}

async function main() {
  await checkTableStructure();
  await testInvestmentCreation();
}

main();