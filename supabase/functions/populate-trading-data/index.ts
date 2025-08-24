import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Iniciando população de dados de trading...');

    // Buscar todos os planos ativos
    const { data: plans, error: plansError } = await supabaseClient
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
      throw plansError;
    }

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum plano encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📊 Encontrados ${plans.length} planos para popular`);

    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit'];

    for (const plan of plans) {
      console.log(`📈 Populando dados para plano: ${plan.name}`);

      // Gerar operações de arbitragem
      const operations = [];
      const priceHistory = [];
      
      for (let i = 0; i < 10; i++) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        let sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        while (sellExchange === buyExchange) {
          sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        }

        // Preços baseados no par
        let basePrice;
        switch (pair.split('/')[0]) {
          case 'BTC':
            basePrice = 43000 + (Math.random() - 0.5) * 2000;
            break;
          case 'ETH':
            basePrice = 2600 + (Math.random() - 0.5) * 200;
            break;
          case 'BNB':
            basePrice = 300 + (Math.random() - 0.5) * 30;
            break;
          case 'ADA':
            basePrice = 0.5 + (Math.random() - 0.5) * 0.1;
            break;
          case 'SOL':
            basePrice = 100 + (Math.random() - 0.5) * 20;
            break;
          default:
            basePrice = 100;
        }

        const profitPercentage = (plan.daily_rate / 100) * (0.8 + Math.random() * 0.4);
        const sellPrice = basePrice * (1 + profitPercentage / 100);
        const volume = Math.random() * 10 + 1;
        const profitAmount = volume * basePrice * (profitPercentage / 100);

        operations.push({
          plan_id: plan.id,
          operation_id: `op_${Date.now()}_${i}`,
          pair,
          buy_exchange: buyExchange,
          sell_exchange: sellExchange,
          buy_price: basePrice,
          sell_price: sellPrice,
          volume,
          profit_amount: profitAmount,
          profit_percentage: profitPercentage,
          execution_time: Math.floor(Math.random() * 300) + 60, // 1-5 minutos
          completed_at: new Date(Date.now() - i * 60000).toISOString() // Operações nos últimos 10 minutos
        });

        // Adicionar dados de preços
        priceHistory.push({
          plan_id: plan.id,
          pair,
          exchange: buyExchange,
          price: basePrice,
          volume,
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        });
      }

      // Inserir operações
      const { error: operationsError } = await supabaseClient
        .from('plan_arbitrage_operations')
        .insert(operations);

      if (operationsError) {
        console.error(`❌ Erro ao inserir operações para ${plan.name}:`, operationsError);
        continue;
      }

      // Inserir histórico de preços
      const { error: pricesError } = await supabaseClient
        .from('plan_price_history')
        .insert(priceHistory);

      if (pricesError) {
        console.error(`❌ Erro ao inserir preços para ${plan.name}:`, pricesError);
        continue;
      }

      console.log(`✅ Dados populados para ${plan.name}`);
    }

    console.log('🎉 População de dados concluída!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados de trading populados com sucesso',
        plans_processed: plans.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na função:', error);
    const dbError = error as DatabaseError;
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: dbError.message,
        hint: dbError.hint 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});