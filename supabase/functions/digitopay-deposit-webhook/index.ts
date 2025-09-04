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
      created_at: new Date().toISOString()
    });

    // Extrair dados do webhook conforme documentação oficial DigitoPay
    const { 
      id: trxId, 
      externalId,
      status, 
      value, 
      person,
      customer,
      paymentMethod,
      type,
      createdAt,
      updatedAt
    } = webhookData;

    // Suporte para ambos os formatos: person (antigo) e customer (novo padrão)
    const customerData = customer || person || {};
    const customerName = customerData.name || webhookData.person?.name || 'Usuário';
    const customerCpf = customerData.document || customerData.cpf || webhookData.person?.cpf || '';

    if (!trxId) {
      console.error('❌ Webhook sem ID da transação');
      return new Response(JSON.stringify({ error: 'Missing transaction ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar transação no banco - múltiplas estratégias conforme documentação
    let transaction = null;
    let transactionError = null;

    // Estratégia 1: Buscar pelo trx_id (ID da transação no DigitoPay)
    const { data: trxData, error: trxError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', trxId)
      .eq('type', 'deposit')
      .single();

    if (trxData) {
      transaction = trxData;
      console.log('✅ Transação encontrada pelo trx_id:', trxId);
    } else {
      // Estratégia 2: Buscar pelo externalId se fornecido
      if (externalId) {
        const { data: extData, error: extError } = await supabase
          .from('digitopay_transactions')
          .select('*')
          .eq('external_id', externalId)
          .eq('type', 'deposit')
          .single();

        if (extData) {
          transaction = extData;
          console.log('✅ Transação encontrada pelo external_id:', externalId);
        } else {
          // Estratégia 3: Buscar pelo idempotency_key (fallback)
          const { data: idempData, error: idempError } = await supabase
            .from('digitopay_transactions')
            .select('*')
            .eq('idempotency_key', trxId)
            .eq('type', 'deposit')
            .single();

          if (idempData) {
            transaction = idempData;
            console.log('✅ Transação encontrada pelo idempotency_key:', trxId);
          } else {
            transactionError = trxError || extError || idempError;
          }
        }
      } else {
        transactionError = trxError;
      }
    }

    if (transactionError || !transaction) {
      console.error('❌ Transação de depósito não encontrada:', trxId);
      await supabase.from('digitopay_debug').insert({
        tipo: 'deposit_transaction_not_found',
        payload: { trxId, error: transactionError, webhookData },
        created_at: new Date().toISOString()
      });
      return new Response(JSON.stringify({ error: 'Deposit transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Transação de depósito encontrada:', transaction);

    // Mapear status do DigitoPay para status interno conforme documentação
    let internalStatus = 'pending';
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'completed':
      case 'realizado':
      case 'success':
      case 'successful':
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
      case 'rejected':
        internalStatus = 'failed';
        break;
      case 'expired':
      case 'expirado':
        internalStatus = 'expired';
        break;
      case 'pending':
      case 'pendente':
      case 'waiting':
        internalStatus = 'pending';
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
      .eq('trx_id', transaction.trx_id);

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

      // Registrar na tabela de depósitos com dados corretos do webhook
      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: transaction.user_id,
          amount_usd: transaction.amount,
          amount_brl: transaction.amount_brl,
          type: 'pix',
          status: 'paid',
          holder_name: customerName || transaction.person_name,
          cpf: customerCpf || transaction.person_cpf,
          pix_code: transaction.pix_code,
          exchange_rate: parseFloat(transaction.amount_brl) / parseFloat(transaction.amount) || 1.0,
          // Adicionar dados do webhook para auditoria
          webhook_data: {
            digitopay_id: trxId,
            external_id: externalId,
            payment_method: paymentMethod,
            processed_at: new Date().toISOString()
          }
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
        amount: transaction.amount_brl,
        webhookData
      },
      created_at: new Date().toISOString()
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
        created_at: new Date().toISOString()
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