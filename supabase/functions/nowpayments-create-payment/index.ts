import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { amount, currency = 'usd' } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Buscar configuração da NOWPayments
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    if (!nowpaymentsApiKey) {
      return new Response(
        JSON.stringify({ error: 'NOWPayments API key não configurada' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('🚀 Criando pagamento NOWPayments para:', { user_id: user.id, amount, currency })

    // Buscar cotação BNB/USD na NOWPayments
    const estimateResponse = await fetch(
      `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency}&currency_to=bnb`,
      {
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      }
    )

    if (!estimateResponse.ok) {
      console.error('❌ Erro ao buscar cotação:', estimateResponse.statusText)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar cotação' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const estimate = await estimateResponse.json()
    console.log('💰 Cotação obtida:', estimate)

    // Criar pagamento na NOWPayments
    const paymentData = {
      price_amount: amount,
      price_currency: currency,
      pay_currency: 'bnb',
      order_id: `bnb_${user.id}_${Date.now()}`,
      order_description: `Depósito BNB20 - ${amount} ${currency.toUpperCase()}`,
      ipn_callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
      success_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-success`,
      cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-cancel`,
    }

    const paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': nowpaymentsApiKey,
      },
      body: JSON.stringify(paymentData),
    })

    if (!paymentResponse.ok) {
      console.error('❌ Erro ao criar pagamento:', paymentResponse.statusText)
      const errorData = await paymentResponse.text()
      console.error('❌ Detalhes do erro:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pagamento' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const paymentResult = await paymentResponse.json()
    console.log('✅ Pagamento criado:', paymentResult)

    // Gerar QR Code para o endereço de pagamento
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${paymentResult.pay_address}`

    // Salvar transação no banco
    const { error: dbError } = await supabaseClient
      .from('bnb20_transactions')
      .insert({
        user_id: user.id,
        payment_id: paymentResult.payment_id,
        type: 'deposit',
        amount_usd: amount,
        amount_bnb: estimate.estimated_amount,
        status: 'waiting',
        pay_address: paymentResult.pay_address,
        payin_extra_id: paymentResult.payin_extra_id,
        pay_amount: paymentResult.pay_amount,
        pay_currency: paymentResult.pay_currency,
        price_currency: currency,
        qr_code_base64: qrCodeUrl,
        nowpayments_response: paymentResult,
        expires_at: paymentResult.expiration_estimate_date ? new Date(paymentResult.expiration_estimate_date) : null,
      })

    if (dbError) {
      console.error('❌ Erro ao salvar transação:', dbError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar transação' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ Transação salva no banco com sucesso')

    // Retornar dados do pagamento
    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentResult.payment_id,
        pay_address: paymentResult.pay_address,
        pay_amount: paymentResult.pay_amount,
        pay_currency: paymentResult.pay_currency,
        qr_code_url: qrCodeUrl,
        expires_at: paymentResult.expiration_estimate_date,
        status: 'waiting',
        amount_usd: amount,
        amount_bnb: estimate.estimated_amount,
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})