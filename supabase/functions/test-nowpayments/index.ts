import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    
    if (!nowpaymentsApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'NOWPayments API key não configurada',
          success: false 
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('🔑 Testando NOWPayments API Key...')
    
    // Log da API key (apenas primeiros e últimos caracteres por segurança)
    const keyMask = nowpaymentsApiKey.length > 8 
      ? `${nowpaymentsApiKey.slice(0, 4)}...${nowpaymentsApiKey.slice(-4)}`
      : 'Key muito curta'
    console.log('🔑 API Key format:', keyMask)

    // Testar status da API
    console.log('📊 Testando endpoint /status...')
    const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    })

    const statusText = await statusResponse.text()
    console.log('📊 Status Response:', statusResponse.status, statusText)

    if (!statusResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Erro na API NOWPayments',
          status: statusResponse.status,
          details: statusText,
          success: false
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    const statusData = JSON.parse(statusText)

    // Testar lista de moedas
    const currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    })

    const currenciesText = await currenciesResponse.text()
    console.log('💰 Currencies Response:', currenciesResponse.status, currenciesText.slice(0, 200))

    let currenciesData = null
    if (currenciesResponse.ok) {
      currenciesData = JSON.parse(currenciesText)
    }

    return new Response(
      JSON.stringify({
        success: true,
        api_status: statusData,
        currencies_available: currenciesData?.currencies?.length || 0,
        bnbbsc_supported: currenciesData?.currencies?.includes('bnbbsc') || false,
        test_passed: statusResponse.ok && currenciesResponse.ok
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})