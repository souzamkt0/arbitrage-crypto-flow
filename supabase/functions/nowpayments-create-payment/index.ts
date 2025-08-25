import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  price_amount: number
  price_currency?: string
  pay_currency?: string
  order_id?: string
  order_description?: string
  ipn_callback_url?: string
  success_url?: string
  cancel_url?: string
}

interface NOWPaymentsResponse {
  payment_id: string
  pay_address: string
  pay_amount: number
  pay_currency: string
  price_amount: number
  price_currency: string
  expiration_estimate_date?: string
  order_id: string
  order_description: string
  payin_extra_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('🚀 Iniciando criação de pagamento NOWPayments')
  
  try {
    // 1. Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Header de autorização ausente')
      return new Response(
        JSON.stringify({ 
          error: 'Login necessário',
          code: 'AUTH_REQUIRED',
          details: 'Header de autorização ausente'
        }),
        { status: 401, headers: corsHeaders }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError?.message || 'Usuário não encontrado')
      return new Response(
        JSON.stringify({ 
          error: 'Acesso negado',
          code: 'AUTH_FAILED', 
          details: authError?.message || 'Token de autenticação inválido'
        }),
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('✅ Usuário autenticado:', user.id)

    // 2. Verificar se API key está configurada
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    if (!nowpaymentsApiKey) {
      console.error('❌ NOWPAYMENTS_API_KEY não configurada')
      return new Response(
        JSON.stringify({ 
          error: 'Configuração inválida',
          code: 'API_KEY_MISSING',
          details: 'Chave da API NOWPayments não configurada'
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ API Key presente:', `${nowpaymentsApiKey.substring(0, 8)}...`)

    // 3. Parse do request body
    let requestData: PaymentRequest
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos',
          code: 'INVALID_JSON',
          details: 'Formato JSON inválido'
        }),
        { status: 400, headers: corsHeaders }
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
    } = requestData

    // 4. Validar dados de entrada
    if (!price_amount || price_amount <= 0) {
      console.error('❌ Valor inválido:', price_amount)
      return new Response(
        JSON.stringify({ 
          error: 'Valor inválido',
          code: 'INVALID_AMOUNT',
          details: 'O valor deve ser maior que zero'
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('📋 Dados da solicitação:', {
      user_id: user.id,
      price_amount,
      price_currency,
      pay_currency
    })

    // 5. Testar conectividade da API NOWPayments
    console.log('🔍 Testando conectividade com NOWPayments...')
    let statusResponse
    try {
      statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      })
    } catch (error) {
      console.error('❌ Erro de conectividade:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Serviço indisponível',
          code: 'CONNECTIVITY_ERROR',
          details: 'Não foi possível conectar ao NOWPayments'
        }),
        { status: 503, headers: corsHeaders }
      )
    }

    if (!statusResponse.ok) {
      console.error('❌ Status da API NOWPayments:', statusResponse.status, statusResponse.statusText)
      return new Response(
        JSON.stringify({ 
          error: 'API indisponível',
          code: 'API_STATUS_ERROR',
          details: `Status: ${statusResponse.status} - ${statusResponse.statusText}`
        }),
        { status: 503, headers: corsHeaders }
      )
    }

    const apiStatus = await statusResponse.json()
    console.log('✅ Status da API NOWPayments:', apiStatus)

    // 6. Verificar moedas disponíveis
    console.log('💰 Verificando moedas disponíveis...')
    let currenciesResponse
    try {
      currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      })
    } catch (error) {
      console.error('❌ Erro ao buscar moedas:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro na verificação de moedas',
          code: 'CURRENCIES_ERROR',
          details: 'Não foi possível verificar moedas disponíveis'
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    if (!currenciesResponse.ok) {
      console.error('❌ Erro ao buscar moedas:', currenciesResponse.status, currenciesResponse.statusText)
      return new Response(
        JSON.stringify({ 
          error: 'Erro na verificação de moedas',
          code: 'CURRENCIES_FETCH_ERROR',
          details: `Status: ${currenciesResponse.status}`
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    const currencies = await currenciesResponse.json()
    console.log('💰 Moedas disponíveis (primeiras 5):', currencies.currencies?.slice(0, 5))

    // Verificar se bnbbsc está disponível
    if (!currencies.currencies?.includes(pay_currency)) {
      console.error('❌ Moeda não disponível:', pay_currency)
      return new Response(
        JSON.stringify({ 
          error: 'Moeda não suportada',
          code: 'CURRENCY_NOT_SUPPORTED',
          details: `Moeda ${pay_currency} não está disponível`
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('✅ Moeda verificada:', pay_currency)

    // 7. Buscar cotação
    console.log('📊 Buscando cotação...')
    const estimateUrl = `https://api.nowpayments.io/v1/estimate?amount=${price_amount}&currency_from=${price_currency}&currency_to=${pay_currency}`
    let estimateResponse
    try {
      estimateResponse = await fetch(estimateUrl, {
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      })
    } catch (error) {
      console.error('❌ Erro ao buscar cotação:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro na cotação',
          code: 'ESTIMATE_ERROR',
          details: 'Não foi possível obter cotação'
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    if (!estimateResponse.ok) {
      const errorText = await estimateResponse.text()
      console.error('❌ Erro na cotação:', estimateResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Erro na cotação',
          code: 'ESTIMATE_FAILED',
          details: `Status: ${estimateResponse.status} - ${errorText}`
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    const estimate = await estimateResponse.json()
    console.log('💱 Cotação obtida:', estimate)

    // 8. Preparar dados do pagamento
    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      order_id: order_id || `bnb_${user.id}_${Date.now()}`,
      order_description: order_description || `Depósito ${pay_currency.toUpperCase()} - $${price_amount}`,
      ipn_callback_url: ipn_callback_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
      success_url: success_url || `https://0b849d20-bf2f-4ce2-949b-d3328f7ae1d9.sandbox.lovable.dev/bnb20?success=true`,
      cancel_url: cancel_url || `https://0b849d20-bf2f-4ce2-949b-d3328f7ae1d9.sandbox.lovable.dev/bnb20?cancelled=true`,
    }

    console.log('📤 Criando pagamento com dados:', JSON.stringify(paymentData, null, 2))

    // 9. Criar pagamento
    let paymentResponse
    try {
      paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': nowpaymentsApiKey,
        },
        body: JSON.stringify(paymentData),
      })
    } catch (error) {
      console.error('❌ Erro na criação do pagamento:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro na criação do pagamento',
          code: 'PAYMENT_CREATION_ERROR',
          details: 'Erro de rede ao criar pagamento'
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('📊 Status da resposta do pagamento:', paymentResponse.status)

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('❌ Erro ao criar pagamento:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        errorText,
        headers: Object.fromEntries(paymentResponse.headers.entries())
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Falha na criação do pagamento',
          code: 'PAYMENT_FAILED',
          status: paymentResponse.status,
          details: errorText
        }),
        { status: paymentResponse.status, headers: corsHeaders }
      )
    }

    const paymentResult: NOWPaymentsResponse = await paymentResponse.json()
    console.log('✅ Pagamento criado com sucesso:', {
      payment_id: paymentResult.payment_id,
      pay_address: paymentResult.pay_address,
      pay_amount: paymentResult.pay_amount,
      pay_currency: paymentResult.pay_currency
    })

    // 10. Gerar QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${paymentResult.pay_address}`

    // 11. Salvar transação no banco
    console.log('💾 Salvando transação no banco...')
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
        JSON.stringify({ 
          error: 'Erro ao salvar transação',
          code: 'DATABASE_ERROR',
          details: dbError.message
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ Transação salva com sucesso')

    // 12. Retornar resposta estruturada
    const response = {
      success: true,
      payment: {
        payment_id: paymentResult.payment_id,
        pay_address: paymentResult.pay_address,
        pay_amount: paymentResult.pay_amount,
        pay_currency: paymentResult.pay_currency,
        qr_code_url: qrCodeUrl,
        expires_at: paymentResult.expiration_estimate_date,
        order_id: paymentResult.order_id,
        order_description: paymentResult.order_description,
        status: 'waiting'
      },
      transaction: {
        amount_usd: price_amount,
        amount_bnb: paymentResult.pay_amount,
        user_id: user.id
      }
    }

    console.log('🎉 Pagamento criado com sucesso!')
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('💥 Erro geral na função:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        details: error.message
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})