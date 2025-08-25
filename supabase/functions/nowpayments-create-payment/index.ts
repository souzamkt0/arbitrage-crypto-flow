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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      ipn_callback_url,
      success_url,
      cancel_url
    }: CreatePaymentRequest = await req.json();

    // Validate required fields
    if (!price_amount || !price_currency || !pay_currency || !order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: price_amount, price_currency, pay_currency, order_id'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (price_amount < 10 || price_amount > 10000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Amount must be between $10.00 and $10,000.00'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get NOWPayments API key
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!nowpaymentsApiKey) {
      console.error('NOWPayments API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Creating NOWPayments payment:', {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      user_id: user.id
    });

    // Create payment with NOWPayments API
    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount,
        price_currency,
        pay_currency,
        order_id,
        order_description: order_description || `USDT Payment - ${order_id}`,
        ipn_callback_url,
        success_url,
        cancel_url,
      }),
    });

    if (!nowpaymentsResponse.ok) {
      const errorData = await nowpaymentsResponse.text();
      console.error('❌ NOWPayments API error:', errorData);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment with NOWPayments',
          details: errorData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nowpaymentsData: NOWPaymentsResponse = await nowpaymentsResponse.json();
    console.log('✅ NOWPayments response:', nowpaymentsData);

    // Generate QR code data URL for the payment address
    let qr_code_base64 = '';
    try {
      const qrResponse = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(nowpaymentsData.pay_address)}&format=png`
      );
      if (qrResponse.ok) {
        const qrBuffer = await qrResponse.arrayBuffer();
        const qrBase64 = btoa(String.fromCharCode(...new Uint8Array(qrBuffer)));
        qr_code_base64 = qrBase64;
      }
    } catch (error) {
      console.warn('⚠️ Failed to generate QR code:', error);
    }

    // Save payment to database
    const paymentData = {
      user_id: user.id,
      payment_id: nowpaymentsData.payment_id,
      amount: nowpaymentsData.price_amount,
      currency_from: nowpaymentsData.price_currency.toUpperCase(),
      currency_to: nowpaymentsData.pay_currency.toUpperCase(),
      status: nowpaymentsData.payment_status,
      payment_address: nowpaymentsData.pay_address,
      actually_paid: 0,
      price_amount: nowpaymentsData.pay_amount,
      order_description: nowpaymentsData.order_description,
      webhook_data: {
        nowpayments_response: nowpaymentsData,
        created_at: new Date().toISOString(),
        qr_code_generated: qr_code_base64 ? true : false
      }
    };

    const { data: savedPayment, error: dbError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save payment to database',
          details: dbError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Payment saved to database:', savedPayment);

    // Return success response
    const response = {
      success: true,
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
      qr_code_base64: qr_code_base64 || null,
      database_id: savedPayment.id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});