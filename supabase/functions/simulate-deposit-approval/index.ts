import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Iniciando simulação de aprovação de depósito...');

    const { trx_id } = await req.json();

    if (!trx_id) {
      throw new Error('trx_id é obrigatório');
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔍 Procurando transação: ${trx_id}`);

    // Buscar a transação
    const { data: transaction, error: fetchError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', trx_id)
      .single();

    if (fetchError || !transaction) {
      console.error('❌ Transação não encontrada:', fetchError);
      throw new Error('Transação não encontrada');
    }

    console.log('📋 Transação encontrada:', {
      id: transaction.id,
      trx_id: transaction.trx_id,
      status: transaction.status,
      amount: transaction.amount,
      user_id: transaction.user_id
    });

    // Verificar se já está completa
    if (transaction.status === 'completed') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Transação já estava aprovada',
          transaction: transaction
        }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    // Simular aprovação: atualizar status para completed
    console.log('✅ Aprovando transação...');
    
    const { error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({
        status: 'completed',
        callback_data: {
          simulated_approval: true,
          approved_at: new Date().toISOString(),
          auto_test: true
        },
        updated_at: new Date().toISOString()
      })
      .eq('trx_id', trx_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar transação:', updateError);
      throw updateError;
    }

    console.log('💰 Atualizando saldo do usuário...');

    // Atualizar saldo do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('balance, display_name, email')
      .eq('user_id', transaction.user_id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil do usuário:', profileError);
      throw profileError;
    }

    const newBalance = (userProfile.balance || 0) + transaction.amount;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({
        balance: newBalance
      })
      .eq('user_id', transaction.user_id);

    if (balanceError) {
      console.error('❌ Erro ao atualizar saldo:', balanceError);
      throw balanceError;
    }

    console.log(`💰 Saldo atualizado: ${userProfile.balance} → ${newBalance} USD`);

    // Criar registro na tabela deposits
    console.log('📝 Criando registro de depósito...');
    
    const { error: depositError } = await supabase
      .from('deposits')
      .insert({
        user_id: transaction.user_id,
        amount_usd: transaction.amount,
        amount_brl: transaction.amount_brl,
        type: 'pix',
        status: 'paid',
        holder_name: transaction.person_name,
        cpf: transaction.person_cpf,
        pix_code: transaction.pix_code,
        exchange_rate: transaction.amount_brl / transaction.amount
      });

    if (depositError) {
      console.error('❌ Erro ao criar registro de depósito:', depositError);
      throw depositError;
    }

    // Log da atividade
    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'simulate_approval',
        payload: {
          trx_id: trx_id,
          user_id: transaction.user_id,
          amount: transaction.amount,
          previous_balance: userProfile.balance,
          new_balance: newBalance,
          timestamp: new Date().toISOString(),
          test_mode: true
        }
      });

    const response = {
      success: true,
      message: 'Depósito aprovado com sucesso (simulação)',
      transaction: {
        trx_id: transaction.trx_id,
        status: 'completed',
        amount: transaction.amount,
        amount_brl: transaction.amount_brl,
        user_id: transaction.user_id
      },
      balance_update: {
        previous: userProfile.balance,
        new: newBalance,
        difference: transaction.amount
      }
    };

    console.log('✅ Simulação concluída:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('💥 Erro na simulação:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});