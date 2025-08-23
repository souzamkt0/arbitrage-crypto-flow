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

    const { amount, cpf, name, callbackUrl, userId, external_reference, transaction_id } = await req.json();

    // Validar se userId é um UUID válido
    if (!userId || typeof userId !== 'string' || userId.length !== 36) {
      console.error('❌ userId inválido:', userId);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'userId inválido - deve ser um UUID válido'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('💰 Criando depósito:', { 
      amount, 
      cpf, 
      name, 
      userId, 
      external_reference,
      transaction_id 
    });

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

    // 2. Criar depósito com token válido e external_reference
    const depositData = {
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      paymentOptions: ['PIX'],
      person: {
        cpf: cpf.replace(/\D/g, ''),
        name: name
      },
      value: amount,
      callbackUrl: callbackUrl,
      idempotencyKey: `deposit_${Date.now()}_${userId}`,
      // Adicionar external_reference para vincular com Supabase
      externalReference: external_reference || `ext_${Date.now()}_${userId.slice(-6)}`
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
      // 3. Se transaction_id foi fornecido, atualizar transação existente
      // Caso contrário, criar nova transação (modo fallback)
      if (transaction_id) {
        console.log('🔄 Atualizando transação existente:', transaction_id);
        
        const { error: updateError } = await supabase
          .from('digitopay_transactions')
          .update({
            trx_id: depositResult.id,
            pix_code: depositResult.pixCopiaECola,
            qr_code_base64: depositResult.qrCodeBase64,
            status: 'waiting_payment',
            gateway_response: depositResult
          })
          .eq('id', transaction_id);

        if (updateError) {
          console.error('❌ Erro ao atualizar transação existente:', updateError);
          // Não falhar por isso, o PIX foi gerado
        } else {
          console.log('✅ Transação existente atualizada com sucesso');
        }
      } else {
        // Modo fallback: criar nova transação
        console.log('📝 Criando nova transação (modo fallback)');
        
        const { error: saveError } = await supabase
          .from('digitopay_transactions')
          .insert({
            user_id: userId,
            trx_id: depositResult.id,
            type: 'deposit',
            amount: amount,
            amount_brl: amount,
            status: 'pending',
            pix_code: depositResult.pixCopiaECola,
            qr_code_base64: depositResult.qrCodeBase64,
            person_name: name,
            person_cpf: cpf,
            external_id: external_reference,
            gateway_response: depositResult
          });

        if (saveError) {
          console.error('❌ Erro ao salvar nova transação:', saveError);
        } else {
          console.log('✅ Nova transação salva com sucesso:', depositResult.id);
        }
      }

      // Log de sucesso
      await supabase
        .from('digitopay_debug')
        .insert({
          tipo: 'digitopay_deposit_success_v2',
          payload: {
            trx_id: depositResult.id,
            user_id: userId,
            amount: amount,
            external_reference: external_reference,
            transaction_id: transaction_id,
            mode: transaction_id ? 'update_existing' : 'create_new'
          }
        });

      return new Response(
        JSON.stringify({
          success: true,
          id: depositResult.id,
          transaction_id: depositResult.id,
          pixCopiaECola: depositResult.pixCopiaECola,
          qrCodeBase64: depositResult.qrCodeBase64,
          external_reference: external_reference,
          message: 'PIX gerado com sucesso - transação vinculada para webhook automático'
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