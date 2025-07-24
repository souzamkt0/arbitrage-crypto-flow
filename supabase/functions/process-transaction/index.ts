import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { trxId } = await req.json();
    
    if (!trxId) {
      return new Response(JSON.stringify({ error: 'Transaction ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔧 Processando transação manualmente:', trxId);

    // Buscar transação
    const { data: transaction, error: transactionError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', trxId)
      .single();

    if (transactionError || !transaction) {
      console.error('❌ Transação não encontrada:', trxId);
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Transação encontrada:', transaction);

    // Atualizar status da transação para completed
    const { error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('trx_id', trxId);

    if (updateError) {
      console.error('❌ Erro ao atualizar transação:', updateError);
      throw updateError;
    }

    console.log('✅ Status da transação atualizado para completed');

    // Se é depósito, atualizar saldo do usuário
    if (transaction.type === 'deposit') {
      console.log('💰 Atualizando saldo do usuário...');

      // Buscar saldo atual
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', transaction.user_id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      const newBalance = parseFloat(profile.balance) + parseFloat(transaction.amount_brl);

      // Atualizar saldo
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', transaction.user_id);

      if (balanceError) {
        console.error('❌ Erro ao atualizar saldo:', balanceError);
        throw balanceError;
      }

      console.log(`✅ Saldo atualizado: R$ ${profile.balance} → R$ ${newBalance}`);

      // Registrar na tabela de depósitos
      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: transaction.user_id,
          amount: transaction.amount_brl,
          payment_method: 'pix',
          status: 'completed',
          gateway_transaction_id: trxId,
          gateway_response: { manually_processed: true }
        });

      if (depositError) {
        console.error('❌ Erro ao registrar depósito:', depositError);
        // Não vamos falhar por isso
      } else {
        console.log('✅ Depósito registrado na tabela deposits');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Transaction processed successfully',
      transactionId: trxId,
      type: transaction.type,
      amount: transaction.amount_brl
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});