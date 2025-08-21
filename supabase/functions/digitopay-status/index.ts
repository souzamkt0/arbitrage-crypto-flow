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

    const { trxId } = await req.json();

    if (!trxId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('🔍 Verificando status da transação:', trxId);

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

    // 2. Verificar status da transação
    const statusResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/statusTransaction/${trxId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Accept': 'application/json'
      }
    });

    const statusData = await statusResponse.json();
    console.log('📊 Status da transação:', statusData);

    // Log para debug
    await supabase
      .from('digitopay_debug')
      .insert({
        tipo: 'status_check_via_edge',
        payload: {
          trxId,
          response: statusData,
          status: statusResponse.status
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: statusData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Erro na Edge Function de status:', error);
    
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
