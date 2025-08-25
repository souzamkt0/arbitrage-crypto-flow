import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

interface NOWPaymentsResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

serve(async (req) => {
  console.log('🔥 Edge Function iniciada - nowpayments-create-payment');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request - returning CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting payment creation process...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    console.log('📊 Supabase URL exists:', !!supabaseUrl);
    console.log('📊 Supabase Anon Key exists:', !!supabaseAnonKey);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get user from JWT token or allow public payments
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header exists:', !!authHeader);
    
    let user = null;
    let isPublicPayment = false;
    const PUBLIC_PAYMENTS_UUID = '00000000-0000-0000-0000-000000000001'; // UUID fixo para pagamentos públicos
    
    if (!authHeader) {
      console.log('⚠️ No authorization header - allowing public payment');
      isPublicPayment = true;
      // Usar UUID fixo para pagamentos públicos
      user = { 
        id: PUBLIC_PAYMENTS_UUID,
        email: 'public@payments.temp'
      };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      console.log('👤 User authentication result:', { user: !!authUser, authError: !!authError });

      if (authError || !authUser) {
        console.log('⚠️ Auth failed, allowing as public payment');
        isPublicPayment = true;
        user = { 
          id: PUBLIC_PAYMENTS_UUID,
          email: 'public@payments.temp'
        };
      } else {
        user = authUser;
        console.log('✅ Authenticated user:', user.id);
      }
    }
    
    console.log('🔍 Final user_id for payment:', user.id, 'isPublic:', isPublicPayment);

    // Parse request body
    const requestBody = await req.json();
    console.log('📥 Input recebido:', JSON.stringify(requestBody, null, 2));
    
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      ipn_callback_url,
      success_url,
      cancel_url,
      mock = false // 🎭 NOVO: parâmetro para ativar dados mockados
    }: CreatePaymentRequest & { mock?: boolean } = requestBody;

    // Validate required fields
    console.log('🔍 Validating required fields...');
    if (!price_amount || !price_currency || !pay_currency || !order_id) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: price_amount, price_currency, pay_currency, order_id'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    console.log('💰 Validating amount:', price_amount);
    if (price_amount < 10 || price_amount > 10000) {
      console.error('❌ Invalid amount');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Amount must be between $10.00 and $10,000.00'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🎭 MODO MOCK: Se ativado, retorna dados simulados sem chamar NOWPayments
    if (mock) {
      console.log('🎭 MODO MOCK ATIVADO - Retornando dados simulados');
      
      const mockPayment = {
        payment_id: `mock_${Date.now()}`,
        payment_status: 'waiting',
        pay_address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Endereço USDT TRC-20 exemplo
        price_amount: price_amount,
        price_currency: price_currency.toUpperCase(),
        pay_amount: price_amount * 0.9999, // Simula pequena diferença de conversão
        pay_currency: pay_currency.toUpperCase(),
        order_id: order_id,
        order_description: order_description || `Mock USDT Payment - ${order_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
      };

      // Gerar QR code mock
      let qr_code_base64 = '';
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(mockPayment.pay_address)}&format=png`;
        const qrResponse = await fetch(qrUrl);
        if (qrResponse.ok) {
          const qrBuffer = await qrResponse.arrayBuffer();
          qr_code_base64 = btoa(String.fromCharCode(...new Uint8Array(qrBuffer)));
        }
      } catch (error) {
        console.warn('⚠️ Failed to generate mock QR code:', error);
      }

      // Salvar pagamento mock no banco
      const mockPaymentData = {
        payment_id: mockPayment.payment_id,
        amount_usd: mockPayment.price_amount,
        status: mockPayment.payment_status
      };

      const { data: savedMockPayment, error: mockDbError } = await supabase
        .from('payments')
        .insert(mockPaymentData)
        .select()
        .single();

      if (mockDbError) {
        console.error('❌ Erro ao salvar pagamento mock:', mockDbError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to save mock payment',
            details: mockDbError.message
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Mock payment saved successfully');

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            ...mockPayment,
            qr_code: qr_code_base64 || null,
            database_id: savedMockPayment.id
          },
          debug_info: {
            mock_mode: true,
            real_nowpayments_call: false,
            supabase_connected: true,
            qr_generated: !!qr_code_base64,
            public_payment: true
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get NOWPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    console.log('🔑 API Key exists:', !!nowpaymentsApiKey);
    console.log('🔑 API Key length:', nowpaymentsApiKey?.length || 0);
    
    const apiUrl = 'https://api.nowpayments.io/v1/payment';
    console.log('🌐 URL chamada:', apiUrl);

    // Validate NOWPayments API key
    if (!nowpaymentsApiKey) {
      console.error('❌ NOWPayments API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOWPayments API key not configured'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🌐 Calling NOWPayments API...');

    // Prepare NOWPayments request data
    const nowpaymentsRequest = {
      price_amount: price_amount,
      price_currency: price_currency.toLowerCase(),
      pay_currency: pay_currency.toLowerCase(),
      order_id: order_id,
      order_description: order_description || `USDT Payment - ${order_id}`,
      ipn_callback_url: ipn_callback_url,
      success_url: success_url,
      cancel_url: cancel_url
    };

    console.log('📤 NOWPayments request:', JSON.stringify(nowpaymentsRequest, null, 2));

    // Call NOWPayments API
    const nowpaymentsResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nowpaymentsRequest)
    });

    console.log('📡 NOWPayments response status:', nowpaymentsResponse.status);

    if (!nowpaymentsResponse.ok) {
      const errorText = await nowpaymentsResponse.text();
      console.error('❌ NOWPayments API error:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOWPayments API error',
          details: errorText,
          status: nowpaymentsResponse.status
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nowpaymentsData: NOWPaymentsResponse = await nowpaymentsResponse.json();
    console.log('✅ NOWPayments API response:', JSON.stringify(nowpaymentsData, null, 2));

    // Save real payment to database
    console.log('💾 Saving real payment data...');
    const paymentData = {
      payment_id: nowpaymentsData.payment_id,
      amount_usd: nowpaymentsData.price_amount,
      status: nowpaymentsData.payment_status
    };

    console.log('📤 Payment data to save:', JSON.stringify(paymentData, null, 2));

    const { data: savedPayment, error: dbError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error on real save:', JSON.stringify(dbError, null, 2));
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save payment to database',
          details: dbError.message,
          code: dbError.code,
          hint: dbError.hint
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Payment saved to database successfully:', savedPayment);

    // Return success response
    const response = {
      success: true,
      payment: {
        payment_id: nowpaymentsData.payment_id,
        pay_address: nowpaymentsData.pay_address,
        pay_amount: nowpaymentsData.pay_amount,
        pay_currency: nowpaymentsData.pay_currency,
        price_amount: nowpaymentsData.price_amount,
        price_currency: nowpaymentsData.price_currency,
        payment_status: nowpaymentsData.payment_status,
        order_id: nowpaymentsData.order_id,
        order_description: nowpaymentsData.order_description,
        created_at: nowpaymentsData.created_at,
        expires_at: nowpaymentsData.expires_at,
        qr_code: null, // QR generation removido para simplificar
        database_id: savedPayment.id
      },
      debug_info: {
        real_nowpayments_call: true,
        supabase_connected: true,
        qr_generated: false,
        public_payment: true
      }
    };

    console.log('🎉 Returning success response:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error details:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        stack: error.stack,
        debug_step: 'catch_block'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});