import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransactionUpdate {
  trx_id: string;
  new_status: string;
  callback_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando sincronização de transações DigitoPay...');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar transações pendentes dos últimos 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error('❌ Erro ao buscar transações pendentes:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Encontradas ${pendingTransactions?.length || 0} transações pendentes`);

    let updatedCount = 0;
    const updates: TransactionUpdate[] = [];

    if (pendingTransactions && pendingTransactions.length > 0) {
      // Simular verificação de status (em produção, aqui faria chamadas para API da DigitoPay)
      for (const transaction of pendingTransactions) {
        // Para demo, vamos simular que algumas transações são aprovadas
        const randomOutcome = Math.random();
        
        // 30% chance de ser aprovada, 10% chance de ser cancelada, 60% continua pendente
        let newStatus = 'pending';
        
        if (randomOutcome < 0.3) {
          newStatus = 'completed';
        } else if (randomOutcome < 0.4) {
          newStatus = 'cancelled';
        }

        if (newStatus !== 'pending') {
          updates.push({
            trx_id: transaction.trx_id,
            new_status: newStatus,
            callback_data: {
              synchronized_at: new Date().toISOString(),
              auto_updated: true,
              previous_status: 'pending'
            }
          });
        }
      }

      // Aplicar atualizações
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('digitopay_transactions')
          .update({
            status: update.new_status,
            callback_data: update.callback_data,
            updated_at: new Date().toISOString()
          })
          .eq('trx_id', update.trx_id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar transação ${update.trx_id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Transação ${update.trx_id} atualizada para ${update.new_status}`);

          // Se foi aprovada, atualizar saldo do usuário
          if (update.new_status === 'completed') {
            const transaction = pendingTransactions.find(t => t.trx_id === update.trx_id);
            if (transaction) {
              const { error: balanceError } = await supabase
                .from('profiles')
                .update({
                  balance: `balance + ${transaction.amount}`.replace('balance + ', '')
                })
                .eq('user_id', transaction.user_id);

              if (balanceError) {
                console.error(`❌ Erro ao atualizar saldo do usuário ${transaction.user_id}:`, balanceError);
              } else {
                console.log(`💰 Saldo do usuário ${transaction.user_id} atualizado (+${transaction.amount} USD)`);
              }

              // Criar registro na tabela deposits
              const { error: depositError } = await supabase
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
                  exchange_rate: transaction.amount_brl / transaction.amount
                });

              if (depositError) {
                console.error(`❌ Erro ao criar registro de depósito:`, depositError);
              } else {
                console.log(`📝 Registro de depósito criado para usuário ${transaction.user_id}`);
              }
            }
          }
        }
      }
    }

    // Log da atividade
    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'sync_transactions',
        payload: {
          checked_transactions: pendingTransactions?.length || 0,
          updated_transactions: updatedCount,
          updates: updates,
          timestamp: new Date().toISOString()
        }
      });

    const response = {
      success: true,
      message: 'Sincronização concluída',
      stats: {
        checked: pendingTransactions?.length || 0,
        updated: updatedCount,
        approved: updates.filter(u => u.new_status === 'completed').length,
        cancelled: updates.filter(u => u.new_status === 'cancelled').length
      }
    };

    console.log('✅ Sincronização concluída:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('💥 Erro na sincronização:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});