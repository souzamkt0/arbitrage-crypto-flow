import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Proxy para webhooks do DigitoPay direcionados para alphabit.vu
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔗 Webhook proxy recebido de alphabit.vu');
    console.log('📍 Método:', req.method);
    console.log('📍 URL:', req.url);

    // Ler o body da requisição
    const webhookData = await req.json();
    console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log do proxy
    await supabase.from('digitopay_debug').insert({
      tipo: 'webhook_proxy_received',
      payload: { 
        method: req.method,
        url: req.url,
        data: webhookData,
        timestamp: new Date().toISOString()
      }
    });

    // Encaminhar para o webhook correto baseado no tipo de transação
    let targetFunction = 'digitopay-webhook'; // Padrão

    // Determinar se é depósito ou saque baseado nos dados
    if (webhookData.type === 'deposit' || webhookData.paymentMethod?.type === 'PIX') {
      targetFunction = 'digitopay-deposit-webhook';
    } else if (webhookData.type === 'withdrawal') {
      targetFunction = 'digitopay-withdrawal-webhook';
    }

    console.log(`🎯 Encaminhando para: ${targetFunction}`);

    // Fazer a requisição para a função correta
    const targetUrl = `${supabaseUrl}/functions/v1/${targetFunction}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(webhookData)
    });

    const responseData = await response.json();
    console.log('📨 Resposta do webhook:', responseData);

    // Log do resultado do proxy
    await supabase.from('digitopay_debug').insert({
      tipo: 'webhook_proxy_forwarded',
      payload: {
        targetFunction,
        targetUrl,
        success: response.ok,
        status: response.status,
        responseData,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Webhook processado via proxy');

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed via proxy',
      targetFunction,
      status: response.status,
      data: responseData
    }), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no webhook proxy:', error);
    
    // Log erro
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('digitopay_debug').insert({
        tipo: 'webhook_proxy_error',
        payload: { 
          error: error.message, 
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('❌ Erro ao logar erro do proxy:', logError);
    }

    return new Response(JSON.stringify({ 
      error: 'Webhook proxy error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});