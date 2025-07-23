import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the webhook data
    const webhookData = await req.json();
    
    // Log the webhook for debugging
    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'webhook_received',
        payload: webhookData
      });

    const { id, status, value, person } = webhookData;

    if (!id) {
      throw new Error('ID da transação não fornecido');
    }

    // Find the transaction in our database
    const { data: transaction, error: findError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', id)
      .single();

    if (findError || !transaction) {
      throw new Error(`Transação não encontrada: ${id}`);
    }

    // Update transaction status
    let newStatus = 'pending';
    
    // DigitoPay webhook status mapping
    if (status === 'PAID' || status === 'REALIZADO') {
      newStatus = 'completed';
    } else if (status === 'CANCELLED' || status === 'CANCELADO') {
      newStatus = 'cancelled';
    } else if (status === 'FAILED' || status === 'FALHOU') {
      newStatus = 'failed';
    } else if (status === 'EXPIRED' || status === 'EXPIRADO') {
      newStatus = 'expired';
    }

    // Update the transaction
    const { error: updateError } = await supabase
      .from('digitopay_transactions')
      .update({
        status: newStatus,
        callback_data: webhookData
      })
      .eq('trx_id', id);

    if (updateError) {
      throw new Error(`Erro ao atualizar transação: ${updateError.message}`);
    }

    // If it's a completed deposit, update user balance
    if (transaction.type === 'deposit' && newStatus === 'completed') {
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: supabase.sql`balance + ${transaction.amount}`
        })
        .eq('user_id', transaction.user_id);

      if (balanceError) {
        console.error('Erro ao atualizar saldo:', balanceError);
      }

      // Also insert into deposits table
      await supabase
        .from('deposits')
        .insert({
          user_id: transaction.user_id,
          amount_usd: transaction.amount,
          amount_brl: transaction.amount_brl,
          type: 'pix',
          status: 'paid',
          holder_name: transaction.person_name,
          cpf: transaction.person_cpf,
          pix_code: transaction.pix_code,
          exchange_rate: 5.40
        });
    }

    // If it's a completed withdrawal, update user balance
    if (transaction.type === 'withdrawal' && newStatus === 'completed') {
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: supabase.sql`balance - ${transaction.amount}`
        })
        .eq('user_id', transaction.user_id);

      if (balanceError) {
        console.error('Erro ao atualizar saldo:', balanceError);
      }

      // Also insert into withdrawals table
      await supabase
        .from('withdrawals')
        .insert({
          user_id: transaction.user_id,
          amount_usd: transaction.amount,
          amount_brl: transaction.amount_brl,
          type: 'pix',
          status: 'completed',
          holder_name: transaction.person_name,
          cpf: transaction.person_cpf,
          pix_key: transaction.pix_key,
          pix_key_type: transaction.pix_key_type,
          fee: 0,
          net_amount: transaction.amount,
          exchange_rate: 5.40,
          completed_date: new Date().toISOString()
        });
    }

    // Log success
    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'webhook_processed',
        payload: {
          trx_id: id,
          original_status: status,
          new_status: newStatus,
          transaction_type: transaction.type,
          value: value,
          person: person
        }
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);

    // Log error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('digitopay_debug')
        .insert({
          tipo: 'webhook_error',
          payload: {
            error: error.message,
            request_body: webhookData || 'Failed to parse'
          }
        });
    } catch (logError) {
      console.error('Error logging webhook error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 