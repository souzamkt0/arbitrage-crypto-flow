import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela investment_plans...');
  
  try {
    // Buscar um plano específico para ver todos os campos
    const { data: plan, error } = await supabase
      .from('investment_plans')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar plano:', error);
      return;
    }
    
    if (plan) {
      console.log('\n📋 Estrutura do primeiro plano:');
      console.log('Campos disponíveis:', Object.keys(plan));
      console.log('\n📊 Dados completos:');
      console.log(JSON.stringify(plan, null, 2));
      
      // Verificar especificamente os campos de valor
      console.log('\n💰 Campos de valor:');
      console.log('- minimum_amount:', plan.minimum_amount, typeof plan.minimum_amount);
      console.log('- maximum_amount:', plan.maximum_amount, typeof plan.maximum_amount);
      console.log('- max_investment_amount:', plan.max_investment_amount, typeof plan.max_investment_amount);
      
      // Verificar se há algum campo similar
      const valueFields = Object.keys(plan).filter(key => 
        key.includes('amount') || key.includes('value') || key.includes('max')
      );
      console.log('\n🔍 Todos os campos relacionados a valor/amount:', valueFields);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructure();