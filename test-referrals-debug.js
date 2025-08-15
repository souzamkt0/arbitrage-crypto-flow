import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

console.log('🔗 Conectando ao Supabase:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugReferralsAndPlans() {
  console.log('🔍 Verificando configuração de referrals e planos...');
  
  try {
    // 1. Verificar planos de investimento e suas regras
    console.log('\n📋 Planos de Investimento:');
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .order('name');
    
    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
    } else {
      plans.forEach(plan => {
        console.log(`  - ${plan.name}: ${plan.required_referrals || 0} referrals necessários`);
        console.log(`    Taxa: ${plan.daily_rate}% | Min: $${plan.minimum_amount} | Max: $${plan.maximum_amount}`);
        console.log(`    Status: ${plan.status}\n`);
      });
    }
    
    // 2. Verificar estrutura da tabela referrals
    console.log('👥 Verificando tabela de referrals...');
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .limit(5);
    
    if (referralsError) {
      console.error('❌ Erro ao buscar referrals:', referralsError);
      console.log('Possível causa: Tabela referrals não existe ou não tem dados');
    } else {
      console.log(`✅ Tabela referrals encontrada com ${referrals.length} registros (mostrando até 5):`);
      referrals.forEach((ref, index) => {
        console.log(`  ${index + 1}. Referrer: ${ref.referrer_id} | Referred: ${ref.referred_id} | Status: ${ref.status}`);
      });
    }
    
    // 3. Verificar se há usuários cadastrados
    console.log('\n👤 Verificando usuários...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, referral_code')
      .limit(3);
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} usuários (mostrando até 3):`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.display_name || 'Sem nome'} | Código: ${profile.referral_code || 'N/A'}`);
      });
    }
    
    // 4. Testar contagem de referrals para um usuário específico
    if (profiles && profiles.length > 0) {
      const testUserId = profiles[0].user_id;
      console.log(`\n🧪 Testando contagem de referrals para usuário: ${testUserId}`);
      
      const { data: userReferrals, error: userReferralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', testUserId)
        .eq('status', 'active');
      
      if (userReferralsError) {
        console.error('❌ Erro ao contar referrals do usuário:', userReferralsError);
      } else {
        console.log(`✅ Usuário tem ${userReferrals.length} referrals ativos`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugReferralsAndPlans();