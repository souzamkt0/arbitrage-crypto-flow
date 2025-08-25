import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Token de autenticação necessário' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔐 Usuário autenticado:', user.id);

    // Verificar se é requisição de status
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const paymentId = url.searchParams.get('payment_id');
      
      if (!paymentId) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'payment_id é obrigatório' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Buscar status na NOWPayments API
      const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
      if (!nowpaymentsApiKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'NOWPayments API key não configurada' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const statusResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
          'Content-Type': 'application/json',
        },
      });

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: statusData.message || 'Erro ao consultar status' 
        }), {
          status: statusResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        ...statusData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Processar criação de pagamento
    const paymentRequest: PaymentRequest = await req.json();
    
    console.log('📝 Dados do pagamento recebidos:', paymentRequest);

    // Validar dados
    if (!paymentRequest.price_amount || !paymentRequest.pay_currency || !paymentRequest.order_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Dados obrigatórios: price_amount, pay_currency, order_id' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar API key da NOWPayments
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!nowpaymentsApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'NOWPayments API key não configurada' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔑 API Key encontrada:', nowpaymentsApiKey.substring(0, 8) + '...');

    // Testar conectividade com NOWPayments
    const statusCheckResponse = await fetch('https://api.nowpayments.io/v1/status', {
      method: 'GET',
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    });

    if (!statusCheckResponse.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro de conectividade com NOWPayments' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Conectividade com NOWPayments OK');

    // Criar pagamento na NOWPayments
    const paymentData = {
      price_amount: paymentRequest.price_amount,
      price_currency: paymentRequest.price_currency || 'usd',
      pay_currency: paymentRequest.pay_currency,
      order_id: paymentRequest.order_id,
      order_description: paymentRequest.order_description || 'Depósito USDT',
      ipn_callback_url: paymentRequest.ipn_callback_url,
      success_url: paymentRequest.success_url,
      cancel_url: paymentRequest.cancel_url,
    };

    console.log('🌐 Enviando para NOWPayments:', paymentData);

    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const nowpaymentsResult = await nowpaymentsResponse.json();

    if (!nowpaymentsResponse.ok) {
      console.error('❌ Erro da NOWPayments:', nowpaymentsResult);
      return new Response(JSON.stringify({ 
        success: false, 
        error: nowpaymentsResult.message || 'Erro na criação do pagamento' 
      }), {
        status: nowpaymentsResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Pagamento criado na NOWPayments:', nowpaymentsResult);

    // Gerar QR Code (base64)
    let qrCodeBase64 = '';
    try {
      if (nowpaymentsResult.pay_address) {
        const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(nowpaymentsResult.pay_address)}`);
        if (qrResponse.ok) {
          const qrBuffer = await qrResponse.arrayBuffer();
          const qrArray = new Uint8Array(qrBuffer);
          qrCodeBase64 = btoa(String.fromCharCode.apply(null, Array.from(qrArray)));
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao gerar QR Code:', error);
    }

    // Salvar transação no banco
    const { error: dbError } = await supabaseClient
      .from('bnb20_transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount_usd: paymentRequest.price_amount,
        amount_bnb: nowpaymentsResult.pay_amount || 0,
        pay_currency: paymentRequest.pay_currency,
        pay_currency_variant: paymentRequest.pay_currency.includes('trc20') ? 'TRC20' : 
                              paymentRequest.pay_currency.includes('erc20') ? 'ERC20' : 
                              paymentRequest.pay_currency.includes('bsc') ? 'BSC' : 'TRC20',
        status: nowpaymentsResult.payment_status || 'pending',
        payment_id: nowpaymentsResult.payment_id,
        pay_address: nowpaymentsResult.pay_address,
        qr_code_base64: qrCodeBase64,
        invoice_id: paymentRequest.order_id,
        nowpayments_response: nowpaymentsResult,
        expires_at: nowpaymentsResult.expires_at ? new Date(nowpaymentsResult.expires_at).toISOString() : null,
      });

    if (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao salvar transação no banco de dados' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Transação salva no banco');

    // Retornar dados do pagamento
    return new Response(JSON.stringify({
      success: true,
      payment_id: nowpaymentsResult.payment_id,
      pay_address: nowpaymentsResult.pay_address,
      pay_amount: nowpaymentsResult.pay_amount,
      qr_code_base64: qrCodeBase64,
      order_id: paymentRequest.order_id,
      payment_status: nowpaymentsResult.payment_status,
      created_at: nowpaymentsResult.created_at,
      expires_at: nowpaymentsResult.expires_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erro na função:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});