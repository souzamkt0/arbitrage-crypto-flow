import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInvestmentPlans() {
  console.log('Testando acesso à tabela investment_plans...');
  
  try {
    // Teste 1: Buscar todos os planos
    console.log('\n1. Buscando todos os planos:');
    const { data: allPlans, error: allError } = await supabase
      .from('investment_plans')
      .select('*');
    
    if (allError) {
      console.error('Erro ao buscar todos os planos:', allError);
      console.error('Detalhes:', {
        message: allError.message,
        details: allError.details,
        hint: allError.hint,
        code: allError.code
      });
    } else {
      console.log('Todos os planos encontrados:', allPlans?.length || 0);
      console.log('Planos:', allPlans);
    }
    
    // Teste 2: Buscar apenas planos ativos
    console.log('\n2. Buscando planos ativos:');
    const { data: activePlans, error: activeError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');
    
    if (activeError) {
      console.error('Erro ao buscar planos ativos:', activeError);
      console.error('Detalhes:', {
        message: activeError.message,
        details: activeError.details,
        hint: activeError.hint,
        code: activeError.code
      });
    } else {
      console.log('Planos ativos encontrados:', activePlans?.length || 0);
      console.log('Planos ativos:', activePlans);
    }
    
    // Teste 3: Verificar estrutura da tabela
    console.log('\n3. Verificando estrutura da tabela:');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'investment_plans' })
      .single();
    
    if (tableError) {
      console.log('Função get_table_columns não disponível, isso é normal.');
    } else {
      console.log('Estrutura da tabela:', tableInfo);
    }
    
  } catch (error) {
    console.error('Erro geral no teste:', error);
  }
}

testInvestmentPlans();