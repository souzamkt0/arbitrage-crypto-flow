import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatusRequest {
  payment_id?: string;
  transaction_id?: string;
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
    const requestBody = await req.json().catch(() => ({}));
    const { payment_id, transaction_id, test }: StatusRequest & { test?: boolean } = requestBody;

    // If it's a test request, just check API connectivity
    if (test) {
      try {
        const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
        if (!nowpaymentsApiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'NOWPayments API key not configured'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test API connection by getting available currencies
        console.log('🔗 Testing NOWPayments API connection...');
        const testResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
          method: 'GET',
          headers: {
            'x-api-key': nowpaymentsApiKey,
          },
        });

        if (testResponse.ok) {
          const currencies = await testResponse.json();
          console.log('✅ NOWPayments API connection successful');
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'NOWPayments API connection successful',
              environment: 'production',
              currencies_count: currencies.currencies?.length || 0,
              test_result: 'API responded successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const errorText = await testResponse.text();
          console.error('❌ NOWPayments API test failed:', errorText);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: 'NOWPayments API connection failed',
              details: errorText,
              status_code: testResponse.status
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('❌ NOWPayments connection test error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to test NOWPayments connection',
            details: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!payment_id && !transaction_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either payment_id or transaction_id is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find transaction in database
    let query = supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id);

    if (payment_id) {
      query = query.eq('payment_id', payment_id);
    } else if (transaction_id) {
      query = query.eq('id', transaction_id);
    }

    const { data: payment, error: dbError } = await query.single();

    if (dbError || !payment) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment not found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Checking payment status:', {
      payment_id: payment.payment_id,
      current_status: payment.status,
      user_id: user.id
    });

    // If we have a payment_id, check status with NOWPayments
    let updatedStatus = payment.status;
    let nowpaymentsData = null;

    if (payment.payment_id) {
      try {
        const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
        if (nowpaymentsApiKey) {
          const statusResponse = await fetch(
            `https://api.nowpayments.io/v1/payment/${payment.payment_id}`,
            {
              method: 'GET',
              headers: {
                'x-api-key': nowpaymentsApiKey,
              },
            }
          );

          if (statusResponse.ok) {
            nowpaymentsData = await statusResponse.json();
            const newStatus = nowpaymentsData.payment_status;
            
            console.log('✅ NOWPayments status check:', {
              payment_id: payment.payment_id,
              old_status: payment.status,
              new_status: newStatus
            });

            // Update status if it changed
            if (newStatus && newStatus !== payment.status) {
              const updateData = {
                status: newStatus,
                actually_paid: nowpaymentsData.actually_paid || payment.actually_paid,
                webhook_data: {
                  ...payment.webhook_data,
                  last_status_check: new Date().toISOString(),
                  nowpayments_status_response: nowpaymentsData
                }
              };

              const { error: updateError } = await supabase
                .from('payments')
                .update(updateData)
                .eq('id', payment.id);

              if (!updateError) {
                updatedStatus = newStatus;
                console.log('✅ Payment status updated in database');
              } else {
                console.error('❌ Failed to update payment status:', updateError);
              }
            }
          } else {
            console.warn('⚠️ Failed to check NOWPayments status:', await statusResponse.text());
          }
        }
      } catch (error) {
        console.error('❌ Error checking NOWPayments status:', error);
      }
    }

    // Return payment status
    const response = {
      success: true,
      payment_id: payment.payment_id,
      transaction_id: payment.id,
      payment_status: updatedStatus,
      pay_status: updatedStatus, // Alias for compatibility
      amount: payment.amount,
      currency_from: payment.currency_from,
      currency_to: payment.currency_to,
      payment_address: payment.payment_address,
      actually_paid: payment.actually_paid || 0,
      price_amount: payment.price_amount,
      order_id: payment.payment_id, // Using payment_id as order_id for now
      order_description: payment.order_description,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      nowpayments_data: nowpaymentsData
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