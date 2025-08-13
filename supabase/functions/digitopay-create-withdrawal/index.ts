/// <reference path="./types.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração do Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para gerar ID único
function generateUniqueId(): string {
  return `mock_withdrawal_${Date.now()}`
}

// Função para log de debug
async function logDebug(data: any) {
  const debugData = {
    function_name: 'digitopay-create-withdrawal',
    timestamp: new Date().toISOString(),
    data: JSON.stringify(data)
  }
  
  try {
    await supabase
      .from('digitopay_debug')
      .insert(debugData)
  } catch (error) {
    console.error('Erro ao salvar log:', error)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { valor: amount, cpf, nome: name, chave_pix: pixKey, tipo_chave_pix: pixKeyType } = requestData;

    console.log('🚀 Processando solicitação de saque (modo teste):', {
      amount,
      cpf,
      name,
      pixKey,
      pixKeyType,
      originalData: requestData
    });

    // Validar dados obrigatórios
    if (!amount || !cpf || !name || !pixKey || !pixKeyType) {
      throw new Error('Dados obrigatórios não fornecidos: ' + JSON.stringify({ amount, cpf, name, pixKey, pixKeyType }));
    }

    // Simular criação de saque (sem chamar API externa)
    console.log('💸 Simulando criação de saque...');
    const mockWithdrawalData = {
      id: `mock_withdrawal_${Date.now()}`,
      isSend: false,
      status: 'pending',
      amount: amount,
      pixKey: pixKey,
      created_at: new Date().toISOString()
    };

    console.log('✅ Saque simulado criado:', mockWithdrawalData);

    // 3. Log de sucesso
    await supabase.from('digitopay_debug').insert({
      tipo: 'withdrawal_request_created',
      payload: {
        digitopayId: mockWithdrawalData.id,
        amount,
        pixKey,
        name,
        response: mockWithdrawalData
      },
      timestamp: new Date().toISOString()
    });

    console.log('🎉 Solicitação de saque simulada criada com sucesso');

    return new Response(JSON.stringify({
      success: true,
      id: mockWithdrawalData.id,
      isSend: mockWithdrawalData.isSend,
      message: 'Saque simulado criado com sucesso'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na criação do saque:', error);

    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});