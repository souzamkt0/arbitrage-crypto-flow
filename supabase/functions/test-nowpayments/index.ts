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
    console.log('🔧 INICIANDO DIAGNÓSTICO COMPLETO...')

    // 1. Verificar autenticação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('👤 Usuário autenticado:', user ? 'SIM' : 'NÃO', authError ? `Erro: ${authError.message}` : '')

    // 2. Verificar se API key existe
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    const hasApiKey = !!nowpaymentsApiKey
    console.log('🔑 API Key NOWPayments:', hasApiKey ? 'CONFIGURADA' : '❌ NÃO CONFIGURADA')
    
    if (hasApiKey && nowpaymentsApiKey) {
      const keyMask = nowpaymentsApiKey.length > 8 
        ? `${nowpaymentsApiKey.slice(0, 4)}...${nowpaymentsApiKey.slice(-4)}`
        : '❌ Key muito curta'
      console.log('🔑 Formato da Key:', keyMask)
    }

    // 3. Testar conectividade básica com NOWPayments (sem auth)
    let apiConnectivity = false
    let apiError = null
    
    try {
      const testResponse = await fetch('https://api.nowpayments.io/v1/status', {
        method: 'GET',
        // Sem API key para testar conectividade básica
      })
      apiConnectivity = testResponse.status === 401 || testResponse.status === 200 // 401 é esperado sem API key
      console.log('🌐 Conectividade NOWPayments:', apiConnectivity ? '✅ OK' : '❌ FALHA', `Status: ${testResponse.status}`)
    } catch (error) {
      apiError = error.message
      console.log('🌐 Erro de conectividade:', apiError)
    }

    // 4. Testar com API Key se disponível
    let apiStatus = null
    let apiKeyValid = false
    
    if (hasApiKey && nowpaymentsApiKey) {
      try {
        const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
          headers: { 'x-api-key': nowpaymentsApiKey },
        })
        
        const statusText = await statusResponse.text()
        console.log('📊 Resposta da API:', statusResponse.status, statusText.slice(0, 100))
        
        if (statusResponse.ok) {
          apiStatus = JSON.parse(statusText)
          apiKeyValid = true
        } else {
          apiStatus = { error: statusText, status: statusResponse.status }
        }
      } catch (error) {
        console.error('❌ Erro ao testar API:', error.message)
        apiStatus = { error: error.message }
      }
    }

    // 5. Testar acesso à tabela
    let dbAccess = false
    let dbError = null
    
    if (user) {
      try {
        const { data, error } = await supabaseClient
          .from('bnb20_transactions')
          .select('id')
          .limit(1)
        
        dbAccess = !error
        if (error) dbError = error.message
        console.log('🗄️ Acesso ao banco:', dbAccess ? '✅ OK' : '❌ FALHA', dbError || '')
      } catch (error) {
        dbError = error.message
        console.log('🗄️ Erro no banco:', dbError)
      }
    }

    return new Response(
      JSON.stringify({
        success: hasApiKey && apiConnectivity && (apiKeyValid || !hasApiKey) && (dbAccess || !user),
        diagnostics: {
          user_authenticated: !!user,
          api_key_configured: hasApiKey,
          api_connectivity: apiConnectivity,
          api_key_valid: apiKeyValid,
          database_access: dbAccess,
          errors: {
            auth_error: authError?.message || null,
            api_error: apiError,
            api_status_error: apiStatus?.error || null,
            db_error: dbError
          },
          api_status: apiStatus
        },
        recommendations: [
          ...(!user ? ['Faça login primeiro'] : []),
          ...(!hasApiKey ? ['Configure a API Key NOWPayments no Supabase'] : []),
          ...(!apiConnectivity ? ['Verifique conexão com internet'] : []),
          ...(hasApiKey && !apiKeyValid ? ['Verifique se a API Key NOWPayments está correta'] : []),
          ...(user && !dbAccess ? ['Verifique permissões da tabela bnb20_transactions'] : [])
        ]
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('💥 Erro geral no diagnóstico:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        diagnostics: { general_error: true }
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})