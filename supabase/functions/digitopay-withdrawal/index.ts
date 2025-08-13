import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Edge Function digitopay-withdrawal iniciada');
    
    // Verificar método HTTP
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ler dados da requisição
    let requestData;
    try {
      requestData = await req.json();
      console.log('📋 Dados recebidos:', requestData);
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar dados obrigatórios
    const { withdrawalId, amount, pixKey, pixKeyType, holderName, cpf } = requestData;
    
    if (!withdrawalId || !amount || !pixKey || !pixKeyType || !holderName || !cpf) {
      console.log('❌ Dados obrigatórios faltando');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Validação dos dados concluída');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Cliente Supabase inicializado');

    // Simular processamento do saque
    console.log('💰 Simulando processamento do saque...');
    
    const transactionId = `digitopay_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Dados simulados do saque
    const withdrawalData = {
      id: transactionId,
      status: 'PROCESSING',
      amount: amount,
      pixKey: pixKey,
      pixKeyType: pixKeyType,
      holderName: holderName,
      cpf: cpf,
      createdAt: new Date().toISOString(),
      message: 'Saque simulado - processamento manual necessário'
    };
    
    console.log('✅ Saque simulado processado com sucesso');

    // Tentar atualizar withdrawal (se existir)
    console.log('🔄 Tentando atualizar withdrawal...');
    let withdrawalRecord: { user_id: string; amount_usd: number } | null = null;
    try {
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({
          gateway_transaction_id: transactionId,
          gateway_response: withdrawalData,
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar withdrawal (pode não existir):', updateError);
      } else {
        console.log('✅ Withdrawal atualizado com sucesso');
        
        // Buscar dados do withdrawal para obter user_id
        const { data: fetchedWithdrawal, error: fetchError } = await supabase
          .from('withdrawals')
          .select('user_id, amount_usd')
          .eq('id', withdrawalId)
          .single();
        
        if (!fetchError && fetchedWithdrawal) {
          withdrawalRecord = fetchedWithdrawal;
          console.log('✅ Dados do withdrawal obtidos:', withdrawalRecord);
        }
      }
    } catch (updateErr) {
      console.error('⚠️ Erro na atualização do withdrawal:', updateErr);
    }

    // Salvar na tabela digitopay_transactions para rastreamento (se temos os dados)
    if (withdrawalRecord) {
      console.log('💾 Salvando transação...');
      try {
        const { error: transactionError } = await supabase
          .from('digitopay_transactions')
          .insert({
            user_id: withdrawalRecord.user_id,
            trx_id: transactionId,
            type: 'withdrawal',
            amount: withdrawalRecord.amount_usd,
            amount_brl: amount,
            pix_key: pixKey,
            pix_key_type: pixKeyType,
            person_name: holderName,
            person_cpf: cpf,
            status: 'processing',
            gateway_response: withdrawalData
          });

        if (transactionError) {
          console.error('⚠️ Erro ao salvar transação:', transactionError);
        } else {
          console.log('✅ Transação salva com sucesso');
        }
      } catch (transactionErr) {
        console.error('⚠️ Erro na inserção da transação:', transactionErr);
      }
    }

    // Log de debug
    console.log('📝 Salvando log de debug...');
    try {
      await supabase.from('digitopay_debug').insert({
        tipo: 'withdrawal_simulation',
        payload: {
          withdrawalId,
          digitopayId: transactionId,
          amount,
          pixKey,
          holderName,
          note: 'SAQUE SIMULADO - REQUER PROCESSAMENTO MANUAL VIA DIGITOPAY',
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Log de debug salvo');
    } catch (debugError) {
      console.error('⚠️ Erro ao salvar log de debug:', debugError);
    }

    // Retornar resposta de sucesso
    const response = {
      success: true,
      message: 'Saque processado com sucesso (simulado)',
      digitopayId: transactionId,
      withdrawalId,
      amount,
      status: 'processing',
      note: 'Este é um saque simulado. O processamento real deve ser feito manualmente via DigitoPay.'
    };

    console.log('📤 Retornando resposta:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('💥 Erro não tratado na Edge Function:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});