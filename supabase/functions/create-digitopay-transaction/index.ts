import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      user_id, 
      type, 
      amount, 
      amount_brl, 
      person_name, 
      person_cpf, 
      external_id, 
      trx_id 
    } = await req.json();

    console.log('💰 Criando transação DigitoPay via Edge Function:', {
      user_id,
      type,
      amount,
      external_id
    });

    // Usar service role key para contornar RLS
    const { data: transaction, error: transactionError } = await supabase
      .from('digitopay_transactions')
      .insert({
        user_id,
        type,
        amount,
        amount_brl,
        person_name,
        person_cpf,
        status: 'pending',
        external_id,
        trx_id
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: transactionError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('✅ Transação criada com sucesso:', transaction);

    return new Response(
      JSON.stringify({
        success: true,
        transaction
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
