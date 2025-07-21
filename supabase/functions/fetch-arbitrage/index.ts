import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const COINMARKETCAP_API_KEY = '0f376f16-1d3f-4a3d-83fb-7b3731b1db3c';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest');
    url.searchParams.set('start', '1');
    url.searchParams.set('limit', '10');
    url.searchParams.set('convert', 'USD');

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`CoinMarketCap API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const coins = data.data || [];
    // Simular oportunidades de arbitragem com lucro
    const trades = coins
      .map((coin: any) => {
        const buyPrice = coin.quote.USD.price * (1 - Math.random() * 0.01); // até 1% abaixo
        const sellPrice = coin.quote.USD.price * (1 + Math.random() * 0.01); // até 1% acima
        const profit = sellPrice - buyPrice;
        return {
          pair: `${coin.symbol}/USDT`,
          buyPrice,
          sellPrice,
          profit,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      })
      .filter((trade: any) => trade.profit > 0)
      .sort((a: any, b: any) => b.profit - a.profit)
      .slice(0, 5);

    return new Response(
      JSON.stringify({ arbitrage: trades }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    let debug = '';
    if (error instanceof Error) debug = error.message;
    else debug = String(error);
    console.error('Error fetching arbitrage:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch arbitrage', debug }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}); 