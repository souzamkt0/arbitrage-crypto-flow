import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyReferralsMigration() {
  console.log('🔧 Aplicando migração de required_referrals...');
  
  try {
    // 1. Verificar se a coluna já existe
    console.log('\n1️⃣ Verificando se coluna required_referrals existe...');
    const { data: columns, error: columnsError } = await supabase
      .from('investment_plans')
      .select('required_referrals')
      .limit(1);
    
    if (columnsError && columnsError.code === '42703') {
      console.log('❌ Coluna required_referrals não existe. Aplicando migração...');
      
      // 2. Adicionar coluna (usando RPC para executar SQL)
      const { error: addColumnError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.investment_plans ADD COLUMN required_referrals INTEGER DEFAULT 0 NOT NULL;'
      });
      
      if (addColumnError) {
        console.log('❌ Erro ao adicionar coluna:', addColumnError);
        return;
      }
      
      console.log('✅ Coluna required_referrals adicionada!');
    } else {
      console.log('✅ Coluna required_referrals já existe!');
    }
    
    // 3. Atualizar valores dos planos
    console.log('\n2️⃣ Atualizando valores dos planos...');
    
    // Robô 4.0.0 = 0 referrals
    const { error: update40Error } = await supabase
      .from('investment_plans')
      .update({ required_referrals: 0 })
      .ilike('name', '%4.0.0%');
    
    if (update40Error) {
      console.log('❌ Erro ao atualizar Robô 4.0.0:', update40Error);
    } else {
      console.log('✅ Robô 4.0.0 atualizado para 0 referrals');
    }
    
    // Robô 4.0.5 = 10 referrals
    const { error: update405Error } = await supabase
      .from('investment_plans')
      .update({ required_referrals: 10 })
      .ilike('name', '%4.0.5%');
    
    if (update405Error) {
      console.log('❌ Erro ao atualizar Robô 4.0.5:', update405Error);
    } else {
      console.log('✅ Robô 4.0.5 atualizado para 10 referrals');
    }
    
    // Robô 4.1.0 = 20 referrals
    const { error: update41Error } = await supabase
      .from('investment_plans')
      .update({ required_referrals: 20 })
      .ilike('name', '%4.1.0%');
    
    if (update41Error) {
      console.log('❌ Erro ao atualizar Robô 4.1.0:', update41Error);
    } else {
      console.log('✅ Robô 4.1.0 atualizado para 20 referrals');
    }
    
    // 4. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado final...');
    const { data: finalPlans, error: finalError } = await supabase
      .from('investment_plans')
      .select('name, required_referrals')
      .order('name');
    
    if (finalError) {
      console.log('❌ Erro ao verificar planos:', finalError);
    } else {
      console.log('📋 Planos atualizados:');
      finalPlans.forEach(plan => {
        console.log(`  - ${plan.name}: ${plan.required_referrals} referrals necessários`);
      });
    }
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

applyReferralsMigration();