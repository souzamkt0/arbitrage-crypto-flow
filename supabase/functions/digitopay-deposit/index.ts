import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const DIGITOPAY_CONFIG = {
  baseUrl: 'https://api.digitopayoficial.com.br/api',
  clientId: 'da0cdf6c-06dd-4e04-a046-abd00e8b43ed',
  clientSecret: '3f58b8f4-e101-4076-a844-3a64c7915b1a'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { amount, cpf, name, callbackUrl, userId } = await req.json();

    console.log('💰 Criando depósito:', { amount, cpf, name, userId });

    // 1. Primeiro, obter token de autenticação
    const authResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/token/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        clientId: DIGITOPAY_CONFIG.clientId,
        secret: DIGITOPAY_CONFIG.clientSecret
      })
    });

    const authData = await authResponse.json();
    console.log('🔐 Auth response:', authData);

    if (!authResponse.ok || !authData.accessToken) {
      throw new Error('Falha na autenticação');
    }

    // 2. Criar depósito com token válido
    const depositData = {
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      paymentOptions: ['PIX'],
      person: {
        cpf: cpf.replace(/\D/g, ''),
        name: name
      },
      value: amount,
      callbackUrl: callbackUrl,
      idempotencyKey: `deposit_${Date.now()}_${userId}`
    };

    console.log('📦 Dados do depósito:', depositData);

    const depositResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.accessToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(depositData)
    });

    const depositResult = await depositResponse.json();
    console.log('💳 Resultado do depósito:', depositResult);

    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'createDeposit_via_edge',
        payload: {
          request: depositData,
          response: depositResult,
          status: depositResponse.status
        }
      });

    if (depositResponse.ok && depositResult.id) {
      // 3. Salvar transação no banco
      const { error: saveError } = await supabase
        .from('digitopay_transactions')
        .insert({
          user_id: userId,
          trx_id: depositResult.id,
          type: 'deposit',
          amount: amount,
          amount_brl: amount,
          pix_code: depositResult.pixCopiaECola,
          qr_code_base64: depositResult.qrCodeBase64,
          person_name: name,
          person_cpf: cpf,
          gateway_response: depositResult
        });

      if (saveError) {
        console.error('❌ Erro ao salvar transação:', saveError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          id: depositResult.id,
          pixCopiaECola: depositResult.pixCopiaECola,
          qrCodeBase64: depositResult.qrCodeBase64,
          message: 'Depósito criado com sucesso'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: depositResult.message || depositResult.mensagem || 'Erro ao criar depósito',
          errors: depositResult.errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('💥 Erro na Edge Function de depósito:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});