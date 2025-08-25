import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
}

interface WebhookPayload {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid?: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string;
  created_at: string;
  updated_at: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

// Function to verify HMAC signature
async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const payloadBytes = encoder.encode(payload);

    return await crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
  } catch (error) {
    console.error('❌ HMAC verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for webhook processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get request body and signature
    const body = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    console.log('🔔 Webhook received:', {
      method: req.method,
      has_signature: !!signature,
      body_length: body.length
    });

    // Verify HMAC signature if provided
    const webhookSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');
    if (webhookSecret && signature) {
      const isValidSignature = await verifyHmacSignature(body, signature, webhookSecret);
      if (!isValidSignature) {
        console.error('❌ Invalid webhook signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ Webhook signature not verified (missing secret or signature)');
    }

    // Parse webhook payload
    let webhookData: WebhookPayload;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📦 Webhook payload:', webhookData);

    // Save webhook log
    await supabase
      .from('nowpayments_webhooks')
      .insert({
        payment_id: webhookData.payment_id,
        event_type: 'payment_update',
        status: webhookData.payment_status,
        signature: signature || '',
        payload: webhookData,
        processed: false
      });

    // Find payment in database
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_id', webhookData.payment_id)
      .single();

    if (findError || !payment) {
      console.error('❌ Payment not found:', webhookData.payment_id);
      
      // Update webhook as processed even if payment not found
      await supabase
        .from('nowpayments_webhooks')
        .update({
          processed: true,
          error_message: 'Payment not found in database'
        })
        .eq('payment_id', webhookData.payment_id)
        .eq('processed', false);

      return new Response(
        JSON.stringify({ success: false, error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Found payment:', {
      id: payment.id,
      current_status: payment.status,
      new_status: webhookData.payment_status
    });

    // Update payment status and data
    const updateData = {
      status: webhookData.payment_status,
      actually_paid: webhookData.actually_paid || payment.actually_paid,
      webhook_data: {
        ...payment.webhook_data,
        last_webhook_at: new Date().toISOString(),
        webhook_payload: webhookData,
        signature_verified: !!(webhookSecret && signature)
      }
    };

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Failed to update payment:', updateError);
      
      // Mark webhook as failed
      await supabase
        .from('nowpayments_webhooks')
        .update({
          processed: true,
          error_message: updateError.message
        })
        .eq('payment_id', webhookData.payment_id)
        .eq('processed', false);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update payment',
          details: updateError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Payment updated successfully:', {
      payment_id: webhookData.payment_id,
      old_status: payment.status,
      new_status: webhookData.payment_status
    });

    // Handle specific payment statuses
    if (webhookData.payment_status === 'finished' || webhookData.payment_status === 'confirmed') {
      console.log('🎉 Payment completed, updating user balance...');
      
      // Update user balance (you may want to implement this logic)
      // For now, just log the event
      console.log('💰 Payment completed for user:', payment.user_id, 'Amount:', payment.amount);
    }

    // Mark webhook as processed
    await supabase
      .from('nowpayments_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('payment_id', webhookData.payment_id)
      .eq('processed', false);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        payment_id: webhookData.payment_id,
        status: webhookData.payment_status
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
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