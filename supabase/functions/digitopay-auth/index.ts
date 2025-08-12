import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    console.log('🔐 Tentando autenticar com DigitoPay...');
    
    // Fazer requisição para a API do DigitoPay
    const authResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/token/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DigitoPay-Client/1.0'
      },
      body: JSON.stringify({
        clientId: DIGITOPAY_CONFIG.clientId,
        secret: DIGITOPAY_CONFIG.clientSecret
      })
    });

    console.log('📡 Status da resposta:', authResponse.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(authResponse.headers.entries()));

    const responseText = await authResponse.text();
    console.log('📄 Resposta completa:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      throw new Error(`Resposta inválida da API: ${responseText}`);
    }

    if (authResponse.ok && responseData.accessToken) {
      console.log('✅ Autenticação bem-sucedida!');
      return new Response(
        JSON.stringify({
          success: true,
          accessToken: responseData.accessToken,
          expiration: responseData.expiration
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.error('❌ Falha na autenticação:', responseData);
      return new Response(
        JSON.stringify({
          success: false,
          message: responseData.mensagem || responseData.message || 'Erro na autenticação',
          details: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('💥 Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
        details: {
          name: error.name,
          stack: error.stack
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});