import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradingDataRequest {
  planId: string;
  operation: 'generate' | 'history';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    if (req.method === 'POST') {
      const { planId, operation }: TradingDataRequest = await req.json()

      if (operation === 'generate') {
        // Gerar nova operação de arbitragem
        const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'XRP/USDT', 'DOT/USDT', 'MATIC/USDT']
        const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit', 'OKX', 'Huobi', 'Gate.io']

        // Buscar informações do plano
        const { data: planData, error: planError } = await supabaseClient
          .from('investment_plans')
          .select('*')
          .eq('id', planId)
          .single()

        if (planError || !planData) {
          throw new Error('Plano não encontrado')
        }

        const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)]
        const exchangeFrom = exchanges[Math.floor(Math.random() * exchanges.length)]
        let exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)]
        while (exchangeTo === exchangeFrom) {
          exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)]
        }

        // Gerar preços baseados no par
        let buyPrice: number
        switch (pair.split('/')[0]) {
          case 'BTC':
            buyPrice = 43000 + (Math.random() - 0.5) * 4000
            break
          case 'ETH':
            buyPrice = 2600 + (Math.random() - 0.5) * 400
            break
          case 'BNB':
            buyPrice = 300 + (Math.random() - 0.5) * 60
            break
          case 'ADA':
            buyPrice = 0.5 + (Math.random() - 0.5) * 0.2
            break
          case 'SOL':
            buyPrice = 100 + (Math.random() - 0.5) * 40
            break
          case 'XRP':
            buyPrice = 0.6 + (Math.random() - 0.5) * 0.2
            break
          case 'DOT':
            buyPrice = 7 + (Math.random() - 0.5) * 3
            break
          case 'MATIC':
            buyPrice = 0.8 + (Math.random() - 0.5) * 0.4
            break
          default:
            buyPrice = 100
        }

        // Calcular lucro baseado na daily_rate do plano
        const baseProfitPercentage = planData.daily_rate / 100
        const profitPercentage = baseProfitPercentage * (0.6 + Math.random() * 0.8) // ±40% da taxa base
        const sellPrice = buyPrice * (1 + profitPercentage / 100)
        const volume = Math.random() * 50 + 10 // 10-60 volume

        // Inserir dados de trading
        const { data: tradingData, error: tradingError } = await supabaseClient
          .from('plan_trading_data')
          .insert({
            plan_id: planId,
            pair: pair,
            buy_price: buyPrice,
            sell_price: sellPrice,
            volume: volume,
            profit_percentage: profitPercentage,
            exchange_from: exchangeFrom,
            exchange_to: exchangeTo,
            status: 'active'
          })
          .select()
          .single()

        if (tradingError) {
          throw new Error('Erro ao inserir dados de trading: ' + tradingError.message)
        }

        // Inserir histórico de preços
        await supabaseClient
          .from('plan_price_history')
          .insert({
            plan_id: planId,
            pair: pair,
            exchange: exchangeFrom,
            price: buyPrice,
            volume: volume
          })

        // Gerar operação de arbitragem
        const operationId = `ARB_${planId.substr(0, 8)}_${Date.now()}`
        const executionTime = Math.floor(Math.random() * 300) + 60 // 1-6 minutos
        const profitAmount = (volume * profitPercentage) / 100

        await supabaseClient
          .from('plan_arbitrage_operations')
          .insert({
            plan_id: planId,
            operation_id: operationId,
            pair: pair,
            buy_exchange: exchangeFrom,
            sell_exchange: exchangeTo,
            buy_price: buyPrice,
            sell_price: sellPrice,
            volume: volume,
            profit_amount: profitAmount,
            profit_percentage: profitPercentage,
            execution_time: executionTime,
            status: 'completed'
          })

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              tradingData,
              operation: {
                operationId,
                profitAmount,
                executionTime
              }
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      } else if (operation === 'history') {
        // Buscar histórico de operações
        const { data: operations, error: operationsError } = await supabaseClient
          .from('plan_arbitrage_operations')
          .select('*')
          .eq('plan_id', planId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (operationsError) {
          throw new Error('Erro ao buscar operações: ' + operationsError.message)
        }

        // Buscar estatísticas
        const { data: stats, error: statsError } = await supabaseClient
          .from('plan_trading_stats')
          .select('*')
          .eq('plan_id', planId)
          .single()

        if (statsError) {
          console.log('Erro ao buscar estatísticas:', statsError.message)
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              operations: operations || [],
              stats: stats || null
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Gerar dados para todos os planos (GET request)
    if (req.method === 'GET') {
      const { data: plans, error: plansError } = await supabaseClient
        .from('investment_plans')
        .select('id, daily_rate')
        .eq('status', 'active')

      if (plansError) {
        throw new Error('Erro ao buscar planos: ' + plansError.message)
      }

      // Gerar operação para cada plano
      const results = []
      for (const plan of plans) {
        try {
          // Simular dados de trading para este plano
          const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT']
          const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit']

          const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)]
          const exchangeFrom = exchanges[Math.floor(Math.random() * exchanges.length)]
          let exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)]
          while (exchangeTo === exchangeFrom) {
            exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)]
          }

          // Preços simulados
          let buyPrice: number
          switch (pair.split('/')[0]) {
            case 'BTC':
              buyPrice = 43000 + (Math.random() - 0.5) * 2000
              break
            case 'ETH':
              buyPrice = 2600 + (Math.random() - 0.5) * 200
              break
            default:
              buyPrice = 100 + (Math.random() - 0.5) * 20
          }

          const profitPercentage = (plan.daily_rate / 100) * (0.8 + Math.random() * 0.4)
          const sellPrice = buyPrice * (1 + profitPercentage / 100)
          const volume = Math.random() * 20 + 5

          results.push({
            planId: plan.id,
            pair,
            buyPrice,
            sellPrice,
            profitPercentage,
            exchangeFrom,
            exchangeTo,
            volume
          })
        } catch (error) {
          console.log(`Erro ao gerar dados para plano ${plan.id}:`, error)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})