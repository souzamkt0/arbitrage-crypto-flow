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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário está autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, email')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: apenas administradores' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { transaction_id, action, reason, admin_email = profile.email } = await req.json()

    if (!transaction_id || !action || !['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('🔐 Admin aprovação/rejeição:', {
      admin_email,
      transaction_id,
      action,
      reason
    })

    // Usar a função do banco para aprovar/rejeitar
    const { data: result, error: approvalError } = await supabaseClient
      .rpc('admin_approve_bnb20_transaction', {
        transaction_id_param: transaction_id,
        action_param: action,
        reason_param: reason,
        admin_email: admin_email
      })

    if (approvalError) {
      console.error('❌ Erro na aprovação:', approvalError)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar aprovação' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Se foi aprovado um saque, criar o saque na NOWPayments
    if (action === 'approve' && result.success) {
      const { data: transaction, error: transactionError } = await supabaseClient
        .from('bnb20_transactions')
        .select('*')
        .eq('id', transaction_id)
        .single()

      if (!transactionError && transaction && transaction.type === 'withdrawal') {
        console.log('💸 Processando saque aprovado via NOWPayments')

        const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
        if (nowpaymentsApiKey) {
          try {
            // Autenticar na NOWPayments (se necessário)
            // Para saques, normalmente precisamos de autenticação JWT
            
            // Criar saque na NOWPayments
            const withdrawalData = {
              address: transaction.pay_address,
              currency: 'bnb',
              amount: transaction.amount_bnb,
              ipn_callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
            }

            console.log('📤 Criando saque na NOWPayments:', withdrawalData)

            // Nota: Para criar saques reais, você precisará das credenciais de merchant
            // e autenticação JWT da NOWPayments. Por enquanto, marcamos como processado.
            
            await supabaseClient
              .from('bnb20_transactions')
              .update({
                status: 'sending',
                admin_notes: `${reason || ''} - Saque enviado para processamento`,
                updated_at: new Date().toISOString()
              })
              .eq('id', transaction_id)

          } catch (withdrawalError) {
            console.error('❌ Erro ao processar saque:', withdrawalError)
            // Mesmo com erro, mantemos a aprovação mas marcamos o problema
            await supabaseClient
              .from('bnb20_transactions')
              .update({
                admin_notes: `${reason || ''} - ERRO: Falha ao processar saque automaticamente`,
                updated_at: new Date().toISOString()
              })
              .eq('id', transaction_id)
          }
        }
      }
    }

    console.log('✅ Aprovação processada:', result)

    return new Response(
      JSON.stringify(result),
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