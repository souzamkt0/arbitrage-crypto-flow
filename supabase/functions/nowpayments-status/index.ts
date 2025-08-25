import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const url = new URL(req.url)
    const payment_id = url.searchParams.get('payment_id')
    const transaction_id = url.searchParams.get('transaction_id')

    if (!payment_id && !transaction_id) {
      return new Response(
        JSON.stringify({ error: 'payment_id ou transaction_id é obrigatório' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('🔍 Consultando status:', { payment_id, transaction_id, user_id: user.id })

    let transaction
    
    if (transaction_id) {
      // Buscar por ID da transação interna
      const { data, error } = await supabaseClient
        .from('bnb20_transactions')
        .select('*')
        .eq('id', transaction_id)
        .eq('user_id', user.id)
        .single()
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Transação não encontrada' }),
          { status: 404, headers: corsHeaders }
        )
      }
      
      transaction = data
    } else {
      // Buscar por payment_id da NOWPayments
      const { data, error } = await supabaseClient
        .from('bnb20_transactions')
        .select('*')
        .eq('payment_id', payment_id)
        .eq('user_id', user.id)
        .single()
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Transação não encontrada' }),
          { status: 404, headers: corsHeaders }
        )
      }
      
      transaction = data
    }

    // Se temos payment_id, consultar status na NOWPayments
    if (transaction.payment_id) {
      const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
      if (nowpaymentsApiKey) {
        try {
          const statusResponse = await fetch(
            `https://api.nowpayments.io/v1/payment/${transaction.payment_id}`,
            {
              headers: {
                'x-api-key': nowpaymentsApiKey,
              },
            }
          )

          if (statusResponse.ok) {
            const nowpaymentsStatus = await statusResponse.json()
            console.log('📊 Status da NOWPayments:', nowpaymentsStatus)

            // Atualizar status se mudou
            if (nowpaymentsStatus.payment_status !== transaction.status) {
              const { error: updateError } = await supabaseClient
                .from('bnb20_transactions')
                .update({
                  status: nowpaymentsStatus.payment_status,
                  webhook_data: nowpaymentsStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', transaction.id)

              if (!updateError) {
                transaction.status = nowpaymentsStatus.payment_status
                transaction.webhook_data = nowpaymentsStatus
              }
            }
          }
        } catch (error) {
          console.error('⚠️ Erro ao consultar NOWPayments:', error)
          // Continuar com os dados locais
        }
      }
    }

    // Retornar status da transação
    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: transaction.id,
          payment_id: transaction.payment_id,
          type: transaction.type,
          amount_usd: transaction.amount_usd,
          amount_bnb: transaction.amount_bnb,
          status: transaction.status,
          pay_address: transaction.pay_address,
          pay_amount: transaction.pay_amount,
          pay_currency: transaction.pay_currency,
          qr_code_base64: transaction.qr_code_base64,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
          expires_at: transaction.expires_at,
          admin_notes: transaction.admin_notes,
          admin_approved_at: transaction.admin_approved_at,
        }
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})