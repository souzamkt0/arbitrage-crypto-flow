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

console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('Key disponível:', process.env.VITE_SUPABASE_ANON_KEY ? 'Sim' : 'Não');

async function debugInvestmentCreation() {
  try {
    console.log('=== Verificando estrutura da tabela user_investments ===');
    
    // Primeiro, buscar um plano real
    const { data: realPlan, error: planError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('name', 'Robô 4.0.0')
      .single();
    
    if (planError || !realPlan) {
      console.error('Erro ao buscar plano real:', planError);
      return;
    }
    
    console.log('Plano encontrado:', realPlan);
    
    // Calcular valores como no código real
    const amount = 50;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (realPlan.duration_days * 24 * 60 * 60 * 1000));
    const dailyTarget = (amount * realPlan.daily_rate) / 100; // Convertendo para percentual
    
    // Tentar inserir um investimento de teste com dados reais
    const testData = {
      user_id: '123e4567-e89b-12d3-a456-426614174000', // UUID fictício
      investment_plan_id: realPlan.id, // UUID real
      amount: amount,
      daily_rate: realPlan.daily_rate,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      days_remaining: realPlan.duration_days,
      daily_target: dailyTarget,
      total_operations: realPlan.daily_rate === 0.025 ? 30 : 15
    };
    
    console.log('Dados de teste:', testData);
    
    const { data: result, error } = await supabase
      .from('user_investments')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('Erro ao inserir investimento:', error);
      console.error('Código do erro:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      console.error('Message:', error.message);
    } else {
      console.log('Investimento criado com sucesso:', result);
      
      // Limpar o teste
      await supabase
        .from('user_investments')
        .delete()
        .eq('id', result[0].id);
      console.log('Investimento de teste removido.');
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

debugInvestmentCreation();