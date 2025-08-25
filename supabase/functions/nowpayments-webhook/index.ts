import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('x-nowpayments-sig')
    const payload = await req.text()
    
    console.log('🔔 Webhook recebido:', { signature, payload })

    if (!signature) {
      console.error('❌ Assinatura HMAC não encontrada')
      return new Response('Unauthorized', { status: 401 })
    }

    // Verificar assinatura HMAC
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET')
    if (!ipnSecret) {
      console.error('❌ IPN Secret não configurado')
      return new Response('Server error', { status: 500 })
    }

    // Validar webhook
    const payloadData = JSON.parse(payload)
    const sortedPayload = JSON.stringify(payloadData, Object.keys(payloadData).sort())
    
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ipnSecret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    )
    
    const hmacBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(sortedPayload))
    const hmacArray = Array.from(new Uint8Array(hmacBuffer))
    const hmacHex = hmacArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hmacHex !== signature) {
      console.error('❌ Assinatura HMAC inválida')
      // Salvar webhook mesmo com assinatura inválida para debug
      await supabaseClient
        .from('nowpayments_webhooks')
        .insert({
          payment_id: payloadData.payment_id || 'unknown',
          event_type: 'invalid_signature',
          status: payloadData.payment_status || 'unknown',
          signature,
          payload: payloadData,
          processed: false,
          error_message: 'Invalid HMAC signature'
        })
      
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('✅ Assinatura HMAC válida')

    // Salvar webhook no banco
    const { error: webhookError } = await supabaseClient
      .from('nowpayments_webhooks')
      .insert({
        payment_id: payloadData.payment_id,
        event_type: 'payment_update',
        status: payloadData.payment_status,
        signature,
        payload: payloadData,
        processed: false,
      })

    if (webhookError) {
      console.error('❌ Erro ao salvar webhook:', webhookError)
    }

    // Buscar transação correspondente
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('bnb20_transactions')
      .select('*')
      .eq('payment_id', payloadData.payment_id)
      .single()

    if (transactionError || !transaction) {
      console.error('❌ Transação não encontrada:', payloadData.payment_id)
      return new Response('Transaction not found', { status: 404 })
    }

    console.log('📊 Transação encontrada:', transaction.id)

    // Mapear status da NOWPayments para nosso sistema
    let newStatus = payloadData.payment_status
    
    // Status que ativam automaticamente o depósito
    if (['finished', 'confirmed'].includes(payloadData.payment_status)) {
      newStatus = 'finished'
    } else if (['partially_paid'].includes(payloadData.payment_status)) {
      newStatus = 'partially_paid'
    } else if (['failed', 'refunded', 'expired'].includes(payloadData.payment_status)) {
      newStatus = payloadData.payment_status
    } else {
      newStatus = payloadData.payment_status // waiting, confirming, sending
    }

    // Atualizar transação
    const { error: updateError } = await supabaseClient
      .from('bnb20_transactions')
      .update({
        status: newStatus,
        webhook_data: payloadData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar transação:', updateError)
      return new Response('Error updating transaction', { status: 500 })
    }

    // Marcar webhook como processado
    await supabaseClient
      .from('nowpayments_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('payment_id', payloadData.payment_id)
      .eq('processed', false)

    console.log('✅ Webhook processado com sucesso:', {
      payment_id: payloadData.payment_id,
      status: newStatus,
      transaction_id: transaction.id
    })

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('💥 Erro no webhook:', error)
    return new Response('Internal server error', { status: 500 })
  }
})