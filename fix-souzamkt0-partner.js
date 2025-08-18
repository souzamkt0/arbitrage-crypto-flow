// Tornar souzamkt0 como sócio
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cbwpghrkfvczjqzefvix.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function makeSouzamkt0Partner() {
  console.log('🔄 Tornando souzamkt0 como sócio...');
  
  try {
    // 1. Buscar o usuário souzamkt0
    console.log('🔍 Buscando usuário souzamkt0...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    console.log('✅ Usuário encontrado:', {
      user_id: user.user_id,
      email: user.email,
      display_name: user.display_name,
      role: user.role
    });

    // 2. Atualizar para sócio
    console.log('🔄 Atualizando role para partner...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'partner',
        partner_balance: 0.00,
        total_commission: 0.00
      })
      .eq('email', 'souzamkt0@gmail.com');

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError);
      return;
    }

    console.log('✅ Usuário souzamkt0 atualizado como sócio!');

    // 3. Verificar se foi atualizado
    const { data: updatedUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'souzamkt0@gmail.com')
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar atualização:', checkError);
      return;
    }

    console.log('✅ Verificação final:', {
      user_id: updatedUser.user_id,
      email: updatedUser.email,
      role: updatedUser.role,
      partner_balance: updatedUser.partner_balance,
      total_commission: updatedUser.total_commission
    });

    console.log('🎉 souzamkt0 agora é sócio! Pode acessar /partners');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

makeSouzamkt0Partner();


