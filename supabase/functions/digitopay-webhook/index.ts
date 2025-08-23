import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DigitopayWebhookPayload {
  id: string
  external_reference?: string
  status?: string
  event_type?: string
  value?: number
  amount?: number
  person?: {
    name?: string
    cpf?: string
  }
  transaction?: {
    id: string
    status: string
    amount: number
    external_reference?: string
  }
  pix?: {
    id: string
    status: string
    amount: number
    external_reference?: string
  }
  withdrawal?: {
    id: string
    status: string
    amount: number
    external_reference?: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: DigitopayWebhookPayload = await req.json()
    
    console.log('📥 Webhook DigitoPay recebido:', JSON.stringify(payload, null, 2))

    // Determinar external_id e event_type
    const external_id = payload.external_reference || payload.id
    const event_type = payload.event_type || 'status_update'

    // Log do webhook recebido na nova tabela
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        provider: 'digitopay',
        event_type: event_type,
        external_id: external_id,
        payload: payload,
        status: 'received'
      })

    if (logError) {
      console.error('❌ Erro ao salvar log do webhook:', logError)
    }

    // Buscar transação usando external_id ou trx_id
    console.log('🔍 Procurando transação com external_id:', external_id)

    let transaction = null
    let searchField = 'external_id'

    // Primeiro, tentar por external_id
    const { data: externalTransactions, error: externalError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('external_id', external_id)
      .limit(1)

    if (externalTransactions && externalTransactions.length > 0) {
      transaction = externalTransactions[0]
    } else {
      // Fallback: buscar por trx_id
      const { data: trxTransactions, error: trxError } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('trx_id', external_id)
        .limit(1)

      if (trxTransactions && trxTransactions.length > 0) {
        transaction = trxTransactions[0]
        searchField = 'trx_id'
      }
    }

    if (!transaction) {
      console.log('⚠️ Transação não encontrada para external_id:', external_id)
      
      // Atualizar log como erro
      await supabase
        .from('webhook_logs')
        .update({
          status: 'error',
          error_message: `Transação não encontrada para external_id: ${external_id}`,
          processed_at: new Date().toISOString()
        })
        .eq('external_id', external_id)
        .eq('provider', 'digitopay')
        .eq('status', 'received')

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transação não encontrada',
          external_id: external_id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    console.log('📄 Transação encontrada:', {
      id: transaction.id,
      status_atual: transaction.status,
      user_id: transaction.user_id,
      amount: transaction.amount,
      searchField: searchField
    })

    // Mapear status do DigitoPay para status interno
    let internalStatus = 'pending'
    const webhookStatus = payload.status?.toLowerCase()
    
    // Determinar status baseado no event_type e status
    if (event_type === 'pix.received' || 
        event_type === 'pix.confirmed' || 
        event_type === 'payment.approved' ||
        webhookStatus === 'paid' ||
        webhookStatus === 'approved' ||
        webhookStatus === 'completed' ||
        webhookStatus === 'realizado') {
      internalStatus = 'completed'
    } else if (event_type?.includes('failed') || 
               event_type?.includes('rejected') ||
               webhookStatus === 'failed' ||
               webhookStatus === 'error' ||
               webhookStatus === 'falhou') {
      internalStatus = 'failed'
    } else if (webhookStatus === 'cancelled' ||
               webhookStatus === 'canceled' ||
               webhookStatus === 'cancelado') {
      internalStatus = 'cancelled'
    } else if (webhookStatus === 'expired' ||
               webhookStatus === 'expirado') {
      internalStatus = 'expired'
    }

    console.log(`🔄 Atualizando status de ${transaction.status} para ${internalStatus}`)

    // Verificar se o status realmente mudou
    if (transaction.status === internalStatus) {
      console.log('ℹ️ Status já está correto, não há necessidade de atualizar')
      
      await supabase
        .from('webhook_logs')
        .update({
          status: 'skipped',
          error_message: `Status já era ${internalStatus}`,
          processed_at: new Date().toISOString()
        })
        .eq('external_id', external_id)
        .eq('provider', 'digitopay')
        .eq('status', 'received')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Status já atualizado',
          transaction_id: transaction.id,
          status: internalStatus
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Atualizar status da transação
    const { error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({
        status: internalStatus,
        gateway_response: payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar transação:', updateError)
      
      // Atualizar log como erro
      await supabase
        .from('webhook_logs')
        .update({
          status: 'error',
          error_message: `Erro ao atualizar transação: ${updateError.message}`,
          processed_at: new Date().toISOString()
        })
        .eq('external_id', external_id)
        .eq('provider', 'digitopay')
        .eq('status', 'received')

      throw new Error(`Erro ao atualizar transação: ${updateError.message}`)
    }

    console.log(`✅ Transação ${transaction.id} atualizada para status: ${internalStatus}`)

    // Atualizar log como processado
    await supabase
      .from('webhook_logs')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('external_id', external_id)
      .eq('provider', 'digitopay')
      .eq('status', 'received')

    // Log adicional para debug
    await supabase.from('digitopay_debug').insert({
      tipo: 'webhook_processed_v2',
      payload: {
        transaction_id: transaction.id,
        old_status: transaction.status,
        new_status: internalStatus,
        event_type: event_type,
        external_id: external_id,
        search_field: searchField
      }
    })

    // O trigger automático já vai processar a ativação do saldo
    console.log('🎯 Webhook processado com sucesso! Trigger automático ativará o saldo.')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        transaction_id: transaction.id,
        status: internalStatus,
        trigger_will_activate: internalStatus === 'completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro no webhook DigitoPay:', error)
    
    // Log erro na tabela de debug
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase.from('digitopay_debug').insert({
        tipo: 'webhook_error_v2',
        payload: { 
          error: error.message, 
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      })
    } catch (logError) {
      console.error('❌ Erro ao logar erro:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})