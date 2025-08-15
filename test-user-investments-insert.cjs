const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testUserInvestmentInsert() {
  try {
    console.log('=== Testando inserção na tabela user_investments ===');
    
    // Primeiro, vamos buscar um plano de investimento válido
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .limit(1);
    
    if (plansError) {
      console.error('Erro ao buscar planos:', plansError);
      return;
    }
    
    if (!plans || plans.length === 0) {
      console.log('Nenhum plano de investimento encontrado');
      return;
    }
    
    const plan = plans[0];
    console.log('Plano encontrado:', plan);
    
    // Calcular datas
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));
    const amount = plan.minimum_amount;
    const dailyTarget = (amount * plan.daily_rate) / 100;
    
    console.log('Dados para inserção:');
    console.log('- amount:', amount);
    console.log('- daily_rate:', plan.daily_rate);
    console.log('- daily_target:', dailyTarget);
    console.log('- days_remaining:', plan.duration_days);
    
    // Teste 1: Inserção sem daily_target
    console.log('\n--- Teste 1: Inserção sem daily_target ---');
    const { data: result1, error: insertError1 } = await supabase
      .from('user_investments')
      .insert({
        user_id: '123e4567-e89b-12d3-a456-426614174000', // UUID de teste
        investment_plan_id: plan.id,
        amount: amount,
        daily_rate: plan.daily_rate,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        days_remaining: plan.duration_days,
        total_operations: plan.daily_rate === 0.025 ? 30 : plan.daily_rate === 0.02 ? 20 : 15
      })
      .select();
    
    if (insertError1) {
      console.log('❌ Erro na inserção sem daily_target:');
      console.log('Código:', insertError1.code);
      console.log('Mensagem:', insertError1.message);
      console.log('Detalhes:', insertError1.details);
    } else {
      console.log('✅ Inserção sem daily_target bem-sucedida!');
      console.log('Resultado:', result1);
      
      // Limpar o registro de teste
      if (result1 && result1.length > 0) {
        await supabase.from('user_investments').delete().eq('id', result1[0].id);
        console.log('🧹 Registro de teste removido');
      }
    }
    
    // Teste 2: Inserção com daily_target
    console.log('\n--- Teste 2: Inserção com daily_target ---');
    const { data: result2, error: insertError2 } = await supabase
      .from('user_investments')
      .insert({
        user_id: '123e4567-e89b-12d3-a456-426614174000', // UUID de teste
        investment_plan_id: plan.id,
        amount: amount,
        daily_rate: plan.daily_rate,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        days_remaining: plan.duration_days,
        daily_target: dailyTarget,
        total_operations: plan.daily_rate === 0.025 ? 30 : plan.daily_rate === 0.02 ? 20 : 15
      })
      .select();
    
    if (insertError2) {
      console.log('❌ Erro na inserção com daily_target:');
      console.log('Código:', insertError2.code);
      console.log('Mensagem:', insertError2.message);
      console.log('Detalhes:', insertError2.details);
    } else {
      console.log('✅ Inserção com daily_target bem-sucedida!');
      console.log('Resultado:', result2);
      
      // Limpar o registro de teste
      if (result2 && result2.length > 0) {
        await supabase.from('user_investments').delete().eq('id', result2[0].id);
        console.log('🧹 Registro de teste removido');
      }
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testUserInvestmentInsert();