import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const webhookData = await req.json();
    console.log('🔔 Webhook DEPÓSITO recebido:', JSON.stringify(webhookData, null, 2));

    // Log webhook para debug
    await supabase.from('digitopay_debug').insert({
      tipo: 'deposit_webhook_received',
      payload: webhookData,
      timestamp: new Date().toISOString()
    });

    // Extrair dados do webhook
    const { id: trxId, status, value, person } = webhookData;

    if (!trxId) {
      console.error('❌ Webhook sem ID da transação');
      return new Response(JSON.stringify({ error: 'Missing transaction ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', trxId)
      .eq('type', 'deposit') // Garantir que é um depósito
      .single();

    if (transactionError || !transaction) {
      console.error('❌ Transação de depósito não encontrada:', trxId);
      await supabase.from('digitopay_debug').insert({
        tipo: 'deposit_transaction_not_found',
        payload: { trxId, error: transactionError },
        timestamp: new Date().toISOString()
      });
      return new Response(JSON.stringify({ error: 'Deposit transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Transação de depósito encontrada:', transaction);

    // Mapear status do DigitoPay para status interno
    let internalStatus = 'pending';
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'completed':
      case 'realizado': // Status do DigitoPay para pagamento confirmado
        internalStatus = 'completed';
        break;
      case 'cancelled':
      case 'canceled':
      case 'cancelado':
        internalStatus = 'cancelled';
        break;
      case 'failed':
      case 'error':
      case 'falhou':
        internalStatus = 'failed';
        break;
      case 'expired':
      case 'expirado':
        internalStatus = 'expired';
        break;
      default:
        internalStatus = 'pending';
    }

    console.log(`🔄 Atualizando status do depósito de ${transaction.status} para ${internalStatus}`);

    // Atualizar status da transação
    const { error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({
        status: internalStatus,
        callback_data: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('trx_id', trxId);

    if (updateError) {
      console.error('❌ Erro ao atualizar transação de depósito:', updateError);
      throw updateError;
    }

    console.log('✅ Status da transação de depósito atualizado');

    // Se é um depósito aprovado, atualizar saldo do usuário
    if (internalStatus === 'completed') {
      console.log('💰 Processando depósito aprovado...');

      // Atualizar saldo do usuário
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', transaction.user_id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      const currentBalance = parseFloat(currentProfile.balance || '0');
      const newBalance = currentBalance + parseFloat(transaction.amount_brl);

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance.toString()
        })
        .eq('user_id', transaction.user_id);

      if (balanceError) {
        console.error('❌ Erro ao atualizar saldo:', balanceError);
        throw balanceError;
      }

      console.log(`✅ Saldo atualizado: +R$ ${transaction.amount_brl}`);

      // Registrar na tabela de depósitos
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
          exchange_rate: 1.0
        });

      if (depositError) {
        console.error('❌ Erro ao registrar depósito:', depositError);
        // Não vamos falhar por isso, só logar
      } else {
        console.log('✅ Depósito registrado na tabela deposits');
      }
    }

    // Log sucesso
    await supabase.from('digitopay_debug').insert({
      tipo: 'deposit_webhook_processed',
      payload: {
        trxId,
        oldStatus: transaction.status,
        newStatus: internalStatus,
        type: 'deposit',
        amount: transaction.amount_brl
      },
      timestamp: new Date().toISOString()
    });

    console.log('🎉 Webhook de depósito processado com sucesso');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Deposit webhook processed successfully',
      transactionId: trxId,
      status: internalStatus,
      type: 'deposit'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no webhook de depósito:', error);
    
    // Log erro
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('digitopay_debug').insert({
        tipo: 'deposit_webhook_error',
        payload: { error: error.message, stack: error.stack },
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('❌ Erro ao logar erro:', logError);
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      type: 'deposit'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});