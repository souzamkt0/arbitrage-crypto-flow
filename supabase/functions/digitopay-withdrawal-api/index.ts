// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse do body da requisição
    const payload = await req.json();
    console.log('📥 Payload recebido:', JSON.stringify(payload, null, 2));

    // Validar campos obrigatórios básicos
    if (!payload.paymentOptions || !payload.person || !payload.value) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios ausentes',
          required: ['paymentOptions', 'person', 'value'],
          received: Object.keys(payload)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Por enquanto, apenas retornar sucesso com os dados recebidos
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payload recebido com sucesso',
        data: {
          paymentOptions: payload.paymentOptions,
          person: payload.person,
          value: payload.value,
          callbackUrl: payload.callbackUrl,
          idempotencyKey: payload.idempotencyKey,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erro interno:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});