import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestResult {
  success: boolean
  step: string
  details: any
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('🧪 INICIANDO TESTE COMPLETO DA INTEGRAÇÃO NOWPAYMENTS')
  console.log('=' .repeat(60))

  const testResults: TestResult[] = []
  let overallSuccess = true

  try {
    // 1. Verificar autenticação
    console.log('🔐 PASSO 1: Verificando autenticação...')
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      console.error('❌ Header de autorização ausente')
      testResults.push({
        success: false,
        step: 'authentication',
        details: 'Header de autorização não encontrado',
        error: 'AUTH_HEADER_MISSING'
      })
      overallSuccess = false
    } else {
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
        console.error('❌ Erro de autenticação:', authError?.message)
        testResults.push({
          success: false,
          step: 'authentication',
          details: authError?.message || 'Usuário não encontrado',
          error: 'AUTH_FAILED'
        })
        overallSuccess = false
      } else {
        console.log('✅ Usuário autenticado:', user.id)
        testResults.push({
          success: true,
          step: 'authentication',
          details: {
            user_id: user.id,
            email: user.email
          }
        })
      }
    }

    // 2. Verificar API Key
    console.log('\n🔑 PASSO 2: Verificando API Key...')
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    
    if (!nowpaymentsApiKey) {
      console.error('❌ NOWPAYMENTS_API_KEY não configurada')
      testResults.push({
        success: false,
        step: 'api_key_check',
        details: 'Variável de ambiente NOWPAYMENTS_API_KEY não encontrada',
        error: 'API_KEY_MISSING'
      })
      overallSuccess = false
    } else {
      console.log('✅ API Key encontrada:', `${nowpaymentsApiKey.substring(0, 8)}...${nowpaymentsApiKey.slice(-4)}`)
      testResults.push({
        success: true,
        step: 'api_key_check',
        details: {
          key_present: true,
          key_format: `${nowpaymentsApiKey.substring(0, 8)}...${nowpaymentsApiKey.slice(-4)}`,
          key_length: nowpaymentsApiKey.length
        }
      })
    }

    // 3. Testar conectividade da API
    console.log('\n🌐 PASSO 3: Testando conectividade da API...')
    try {
      const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey!,
        },
      })

      console.log('📊 Status da resposta:', statusResponse.status)
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('❌ API não disponível:', statusResponse.status, errorText)
        testResults.push({
          success: false,
          step: 'api_connectivity',
          details: {
            status: statusResponse.status,
            statusText: statusResponse.statusText,
            error: errorText
          },
          error: 'API_UNAVAILABLE'
        })
        overallSuccess = false
      } else {
        const apiStatus = await statusResponse.json()
        console.log('✅ API conectada:', apiStatus)
        testResults.push({
          success: true,
          step: 'api_connectivity',
          details: {
            status: statusResponse.status,
            api_status: apiStatus
          }
        })
      }
    } catch (error) {
      console.error('❌ Erro de conectividade:', error.message)
      testResults.push({
        success: false,
        step: 'api_connectivity',
        details: error.message,
        error: 'CONNECTIVITY_ERROR'
      })
      overallSuccess = false
    }

    // 4. Verificar moedas disponíveis
    console.log('\n💰 PASSO 4: Verificando moedas disponíveis...')
    try {
      const currenciesResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
        headers: {
          'x-api-key': nowpaymentsApiKey!,
        },
      })

      if (!currenciesResponse.ok) {
        const errorText = await currenciesResponse.text()
        console.error('❌ Erro ao buscar moedas:', currenciesResponse.status, errorText)
        testResults.push({
          success: false,
          step: 'currencies_check',
          details: {
            status: currenciesResponse.status,
            error: errorText
          },
          error: 'CURRENCIES_ERROR'
        })
        overallSuccess = false
      } else {
        const currencies = await currenciesResponse.json()
        const bnbAvailable = currencies.currencies?.includes('bnbbsc')
        
        console.log('💰 Total de moedas disponíveis:', currencies.currencies?.length)
        console.log('🔍 BNB BSC disponível:', bnbAvailable)
        console.log('📋 Moedas relacionadas ao BNB:', 
          currencies.currencies?.filter((c: string) => c.toLowerCase().includes('bnb')))

        testResults.push({
          success: true,
          step: 'currencies_check',
          details: {
            total_currencies: currencies.currencies?.length,
            bnbbsc_available: bnbAvailable,
            bnb_related: currencies.currencies?.filter((c: string) => c.toLowerCase().includes('bnb')),
            sample_currencies: currencies.currencies?.slice(0, 10)
          }
        })

        if (!bnbAvailable) {
          console.warn('⚠️ BNBBSC não está disponível!')
          overallSuccess = false
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar moedas:', error.message)
      testResults.push({
        success: false,
        step: 'currencies_check',
        details: error.message,
        error: 'CURRENCIES_FETCH_ERROR'
      })
      overallSuccess = false
    }

    // 5. Testar cotação
    console.log('\n📊 PASSO 5: Testando cotação USD para BNBBSC...')
    try {
      const estimateResponse = await fetch(
        'https://api.nowpayments.io/v1/estimate?amount=10&currency_from=usd&currency_to=bnbbsc',
        {
          headers: {
            'x-api-key': nowpaymentsApiKey!,
          },
        }
      )

      if (!estimateResponse.ok) {
        const errorText = await estimateResponse.text()
        console.error('❌ Erro na cotação:', estimateResponse.status, errorText)
        testResults.push({
          success: false,
          step: 'estimate_test',
          details: {
            status: estimateResponse.status,
            error: errorText
          },
          error: 'ESTIMATE_ERROR'
        })
        overallSuccess = false
      } else {
        const estimate = await estimateResponse.json()
        console.log('✅ Cotação obtida:', estimate)
        testResults.push({
          success: true,
          step: 'estimate_test',
          details: {
            usd_amount: 10,
            bnb_amount: estimate.estimated_amount,
            currency_from: estimate.currency_from,
            currency_to: estimate.currency_to
          }
        })
      }
    } catch (error) {
      console.error('❌ Erro ao testar cotação:', error.message)
      testResults.push({
        success: false,
        step: 'estimate_test',
        details: error.message,
        error: 'ESTIMATE_FETCH_ERROR'
      })
      overallSuccess = false
    }

    // 6. Testar criação de pagamento (SOMENTE SE TUDO ESTIVER OK)
    if (overallSuccess) {
      console.log('\n💳 PASSO 6: Testando criação de pagamento de teste...')
      
      const testPaymentData = {
        price_amount: 10,
        price_currency: 'usd',
        pay_currency: 'bnbbsc',
        order_id: `test_${Date.now()}`,
        order_description: 'Pagamento de teste - NOWPayments Integration Test'
      }

      console.log('📤 Dados do pagamento de teste:', testPaymentData)

      try {
        const paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': nowpaymentsApiKey!,
          },
          body: JSON.stringify(testPaymentData),
        })

        console.log('📊 Status do pagamento:', paymentResponse.status)

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text()
          console.error('❌ Erro ao criar pagamento:', paymentResponse.status, errorText)
          
          let parsedError
          try {
            parsedError = JSON.parse(errorText)
          } catch {
            parsedError = errorText
          }

          testResults.push({
            success: false,
            step: 'payment_creation_test',
            details: {
              status: paymentResponse.status,
              statusText: paymentResponse.statusText,
              error: parsedError,
              request_data: testPaymentData
            },
            error: 'PAYMENT_CREATION_FAILED'
          })
          overallSuccess = false
        } else {
          const paymentResult = await paymentResponse.json()
          console.log('✅ Pagamento de teste criado:', {
            payment_id: paymentResult.payment_id,
            pay_address: paymentResult.pay_address,
            pay_amount: paymentResult.pay_amount
          })

          testResults.push({
            success: true,
            step: 'payment_creation_test',
            details: {
              payment_id: paymentResult.payment_id,
              pay_address: paymentResult.pay_address,
              pay_amount: paymentResult.pay_amount,
              pay_currency: paymentResult.pay_currency,
              order_id: paymentResult.order_id,
              expiration: paymentResult.expiration_estimate_date
            }
          })
        }
      } catch (error) {
        console.error('❌ Erro na criação do pagamento:', error.message)
        testResults.push({
          success: false,
          step: 'payment_creation_test',
          details: error.message,
          error: 'PAYMENT_NETWORK_ERROR'
        })
        overallSuccess = false
      }
    } else {
      console.log('\n⚠️ PASSO 6: Pulando teste de criação de pagamento devido a erros anteriores')
      testResults.push({
        success: false,
        step: 'payment_creation_test',
        details: 'Teste pulado devido a falhas nas verificações anteriores',
        error: 'SKIPPED_DUE_TO_PREVIOUS_ERRORS'
      })
    }

    // Resultado final
    console.log('\n' + '='.repeat(60))
    console.log('🏁 RESULTADO FINAL DO TESTE')
    console.log('='.repeat(60))
    console.log(`Status geral: ${overallSuccess ? '✅ SUCESSO' : '❌ FALHOU'}`)
    console.log(`Passos executados: ${testResults.length}`)
    console.log(`Passos bem-sucedidos: ${testResults.filter(r => r.success).length}`)
    console.log(`Passos falharam: ${testResults.filter(r => !r.success).length}`)

    const finalResult = {
      success: overallSuccess,
      summary: {
        total_steps: testResults.length,
        successful_steps: testResults.filter(r => r.success).length,
        failed_steps: testResults.filter(r => !r.success).length,
        overall_status: overallSuccess ? 'INTEGRATION_OK' : 'INTEGRATION_FAILED'
      },
      test_results: testResults,
      recommendations: overallSuccess 
        ? ['✅ Integração funcionando corretamente!', 'Pronto para uso em produção']
        : ['❌ Corrija os erros encontrados', 'Verifique as configurações da API', 'Teste novamente após correções']
    }

    return new Response(
      JSON.stringify(finalResult, null, 2),
      { 
        status: overallSuccess ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NO TESTE:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        summary: {
          overall_status: 'CRITICAL_ERROR'
        },
        test_results: testResults,
        critical_error: {
          message: error.message,
          stack: error.stack
        }
      }, null, 2),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})