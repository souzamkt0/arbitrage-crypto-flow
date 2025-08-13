import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração da DigitoPay
const DIGITOPAY_CONFIG = {
  baseUrl: 'https://api.digitopayoficial.com.br/api',
  clientId: 'da0cdf6c-06dd-4e04-a046-abd00e8b43ed',
  clientSecret: '3f58b8f4-e101-4076-a844-3a64c7915b1a'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Edge Function digitopay-real-withdrawal iniciada');
    
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

    // 1. Autenticar na DigitoPay
    console.log('🔐 Autenticando na DigitoPay...');
    const authResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/token/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: DIGITOPAY_CONFIG.clientId,
        secret: DIGITOPAY_CONFIG.clientSecret
      })
    });

    if (!authResponse.ok) {
      console.error('❌ Erro na autenticação DigitoPay:', authResponse.status);
      const authError = await authResponse.text();
      console.error('Detalhes do erro de autenticação:', authError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed', 
          message: 'Erro na autenticação com DigitoPay',
          details: authError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.accessToken;
    
    if (!accessToken) {
      console.error('❌ Token de acesso não recebido');
      return new Response(
        JSON.stringify({ error: 'No access token received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Autenticação DigitoPay bem-sucedida');

    // 2. Processar saque na DigitoPay usando endpoint /withdraw
    console.log('💰 Processando saque na DigitoPay...');
    
    const withdrawalData = {
      paymentOptions: ['PIX'],
      person: {
        pixKeyTypes: pixKeyType.toUpperCase(),
        pixKey: pixKey,
        name: holderName,
        cpf: cpf.replace(/\D/g, '')
      },
      value: amount,
      endToEndId: `E${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      idempotencyKey: `${withdrawalId}_${Date.now()}`
    };

    console.log('📋 Dados do saque para DigitoPay:', withdrawalData);

    // Chamar endpoint de saque da DigitoPay
    const withdrawResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(withdrawalData)
    });

    if (!withdrawResponse.ok) {
      console.error('❌ Erro no saque DigitoPay:', withdrawResponse.status);
      const withdrawError = await withdrawResponse.text();
      console.error('Detalhes do erro de saque:', withdrawError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Withdrawal failed', 
          message: 'Erro ao processar saque na DigitoPay',
          details: withdrawError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const withdrawalResult = await withdrawResponse.json();
    console.log('✅ Saque processado na DigitoPay:', withdrawalResult);
    
    const digitopayTransactionId = withdrawalResult.id || `digitopay_${withdrawalId}_${Date.now()}`;

    // 3. Atualizar withdrawal no banco
    console.log('🔄 Atualizando withdrawal no banco...');
    try {
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({
          gateway_transaction_id: digitopayTransactionId,
          gateway_response: withdrawalResult,
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar withdrawal:', updateError);
      } else {
        console.log('✅ Withdrawal atualizado com sucesso');
      }
    } catch (updateErr) {
      console.error('⚠️ Erro na atualização do withdrawal:', updateErr);
    }

    // 4. Buscar dados do withdrawal para salvar transação
    let withdrawalRecord: { user_id: string; amount_usd: number } | null = null;
    try {
      const { data: fetchedWithdrawal, error: fetchError } = await supabase
        .from('withdrawals')
        .select('user_id, amount_usd')
        .eq('id', withdrawalId)
        .single();
      
      if (!fetchError && fetchedWithdrawal) {
        withdrawalRecord = fetchedWithdrawal;
        console.log('✅ Dados do withdrawal obtidos:', withdrawalRecord);
      }
    } catch (fetchErr) {
      console.error('⚠️ Erro ao buscar dados do withdrawal:', fetchErr);
    }

    // 5. Salvar na tabela digitopay_transactions
    if (withdrawalRecord) {
      console.log('💾 Salvando transação...');
      try {
        const { error: transactionError } = await supabase
          .from('digitopay_transactions')
          .insert({
            user_id: withdrawalRecord.user_id,
            trx_id: digitopayTransactionId,
            type: 'withdrawal',
            amount: withdrawalRecord.amount_usd,
            amount_brl: amount,
            pix_key: pixKey,
            pix_key_type: pixKeyType,
            person_name: holderName,
            person_cpf: cpf,
            status: 'processing',
            gateway_response: withdrawalResult
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

    // 6. Log de debug de sucesso
    console.log('📝 Salvando log de debug...');
    try {
      await supabase.from('digitopay_debug').insert({
        tipo: 'withdrawal_success',
        payload: {
          withdrawalId,
          digitopayId: digitopayTransactionId,
          amount,
          pixKey,
          holderName,
          response: withdrawalResult,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Log de debug salvo');
    } catch (debugError) {
      console.error('⚠️ Erro ao salvar log de debug:', debugError);
    }

    // 7. Retornar resposta de sucesso
    const response = {
      success: true,
      message: 'Saque processado com sucesso na DigitoPay',
      digitopayId: digitopayTransactionId,
      withdrawalId,
      amount,
      status: 'processing',
      pixKey,
      holderName
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