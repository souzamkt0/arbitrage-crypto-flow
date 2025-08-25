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

    const { amount, bnb_address, currency = 'usd' } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido' }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!bnb_address) {
      return new Response(
        JSON.stringify({ error: 'Endereço BNB é obrigatório' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar saldo do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: corsHeaders }
      )
    }

    if (profile.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Saldo insuficiente' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('🚀 Criando saque BNB20 para:', { user_id: user.id, amount, bnb_address })

    // Buscar configuração da NOWPayments
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    if (!nowpaymentsApiKey) {
      return new Response(
        JSON.stringify({ error: 'NOWPayments API key não configurada' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Buscar cotação USD/BNB para o saque
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
    console.log('💰 Cotação para saque:', estimate)

    // Criar registro de saque (será processado pelo admin)
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('bnb20_transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount_usd: amount,
        amount_bnb: estimate.estimated_amount,
        status: 'pending', // Aguardando aprovação do admin
        pay_address: bnb_address,
        pay_currency: 'bnb',
        price_currency: currency,
        nowpayments_response: {
          estimated_amount: estimate.estimated_amount,
          withdrawal_address: bnb_address,
          created_at: new Date().toISOString()
        },
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error('❌ Erro ao criar saque:', withdrawalError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar saque' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ Saque criado e aguarda aprovação:', withdrawal.id)

    // Retornar dados do saque
    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawal.id,
        status: 'pending',
        message: 'Saque criado com sucesso. Aguardando aprovação do administrador.',
        amount_usd: amount,
        amount_bnb: estimate.estimated_amount,
        bnb_address: bnb_address,
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