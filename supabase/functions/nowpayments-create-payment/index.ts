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

    const { 
      price_amount, 
      price_currency = 'usd', 
      pay_currency = 'bnbbsc',
      order_id,
      order_description,
      ipn_callback_url,
      success_url,
      cancel_url
    } = await req.json()

    if (!price_amount || price_amount <= 0) {
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

    console.log('🚀 Criando pagamento NOWPayments para:', { user_id: user.id, price_amount, price_currency, pay_currency })

    // Primeiro, verificar se a API está funcionando
    const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    })

    if (!statusResponse.ok) {
      console.error('❌ API NOWPayments indisponível:', statusResponse.statusText)
      return new Response(
        JSON.stringify({ error: 'Serviço NOWPayments temporariamente indisponível' }),
        { status: 503, headers: corsHeaders }
      )
    }

    const apiStatus = await statusResponse.json()
    console.log('✅ Status API NOWPayments:', apiStatus)

    // Verificar moedas disponíveis
    const currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    })

    if (!currenciesResponse.ok) {
      console.error('❌ Erro ao buscar moedas:', currenciesResponse.statusText)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar moedas disponíveis' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const currencies = await currenciesResponse.json()
    console.log('💰 Moedas disponíveis:', currencies.currencies?.slice(0, 10)) // Log apenas primeiras 10

    // Verificar se bnbbsc está disponível
    if (!currencies.currencies?.includes(pay_currency)) {
      console.error('❌ Moeda não disponível:', pay_currency)
      return new Response(
        JSON.stringify({ error: `Moeda ${pay_currency} não disponível` }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Buscar cotação na NOWPayments
    const estimateResponse = await fetch(
      `https://api.nowpayments.io/v1/estimate?amount=${price_amount}&currency_from=${price_currency}&currency_to=${pay_currency}`,
      {
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      }
    )

    if (!estimateResponse.ok) {
      const errorText = await estimateResponse.text()
      console.error('❌ Erro ao buscar cotação:', estimateResponse.statusText, errorText)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar cotação', details: errorText }),
        { status: 500, headers: corsHeaders }
      )
    }

    const estimate = await estimateResponse.json()
    console.log('💰 Cotação obtida:', estimate)

    // Criar pagamento na NOWPayments seguindo a documentação oficial
    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      order_id: order_id || `bnbbsc_${user.id}_${Date.now()}`,
      order_description: order_description || `Depósito ${pay_currency.toUpperCase()} - ${price_amount} ${price_currency.toUpperCase()}`,
      ipn_callback_url: ipn_callback_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
      success_url: success_url || `${Deno.env.get('PUBLIC_URL') || 'https://0b849d20-bf2f-4ce2-949b-d3328f7ae1d9.sandbox.lovable.dev'}/deposit?success=true`,
      cancel_url: cancel_url || `${Deno.env.get('PUBLIC_URL') || 'https://0b849d20-bf2f-4ce2-949b-d3328f7ae1d9.sandbox.lovable.dev'}/deposit?cancelled=true`,
    }

    const paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': nowpaymentsApiKey,
      },
      body: JSON.stringify(paymentData),
    })

    console.log('📤 Enviando dados de pagamento:', JSON.stringify(paymentData, null, 2))

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('❌ Erro ao criar pagamento:', paymentResponse.status, paymentResponse.statusText)
      console.error('❌ Detalhes do erro:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar pagamento', 
          status: paymentResponse.status,
          details: errorText 
        }),
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
        amount_usd: price_amount,
        amount_bnb: paymentResult.pay_amount,
        status: 'waiting',
        pay_address: paymentResult.pay_address,
        payin_extra_id: paymentResult.payin_extra_id,
        pay_amount: paymentResult.pay_amount,
        pay_currency: paymentResult.pay_currency,
        price_currency: price_currency,
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
        amount_usd: price_amount,
        amount_bnb: paymentResult.pay_amount,
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