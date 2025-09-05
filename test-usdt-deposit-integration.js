#!/usr/bin/env node

/**
 * Teste da Integração USDT na Página de Depósitos
 * 
 * Este script testa se a integração do NowPayments USDT
 * está funcionando corretamente na página de depósitos.
 */

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUSDTIntegration() {
  console.log('🧪 Iniciando teste da integração USDT...\n');

  try {
    // 1. Testar conectividade básica
    console.log('1️⃣ Testando conectividade Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conectividade:', testError.message);
      return;
    }
    console.log('✅ Conectividade OK\n');

    // 2. Testar edge function NowPayments
    console.log('2️⃣ Testando edge function nowpayments-create-payment...');
    
    // Primeiro, fazer login com um usuário de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'souzamkt0@gmail.com',
      password: 'Souza123@'
    });

    if (authError) {
      console.log('⚠️ Não foi possível fazer login para teste completo:', authError.message);
      console.log('Continuando com teste básico...\n');
    } else {
      console.log('✅ Login realizado para teste\n');
    }

    // Testar criação de pagamento USDT
    const testPayment = {
      price_amount: 50.00,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: `test_usdt_${Date.now()}`,
      order_description: 'Teste de integração USDT TRC-20',
      ipn_callback_url: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/nowpayments-webhook',
      success_url: 'https://arbitrage-crypto-flow.vercel.app/deposit?success=true',
      cancel_url: 'https://arbitrage-crypto-flow.vercel.app/deposit?cancelled=true'
    };

    console.log('3️⃣ Testando criação de pagamento USDT...');
    console.log('📋 Dados do teste:', JSON.stringify(testPayment, null, 2));

    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('nowpayments-create-payment', {
      body: testPayment
    });

    if (paymentError) {
      console.error('❌ Erro na edge function:', paymentError.message);
      console.error('Detalhes:', paymentError);
    } else if (paymentData && paymentData.success) {
      console.log('✅ Pagamento USDT criado com sucesso!');
      console.log('💳 ID do Pagamento:', paymentData.payment_id || 'N/A');
      console.log('📍 Endereço:', paymentData.pay_address || 'N/A');
      console.log('💰 Valor:', paymentData.pay_amount || 'N/A', (paymentData.pay_currency || 'USDT').toUpperCase());
      console.log('⏰ Expira em:', paymentData.expires_at || 'N/A');
      console.log('📊 Dados completos:', JSON.stringify(paymentData, null, 2));
    } else {
      console.error('❌ Resposta inválida da edge function:', JSON.stringify(paymentData, null, 2));
    }

    console.log('\n4️⃣ Testando consulta de status...');
    if (paymentData && paymentData.payment_id) {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('nowpayments-status', {
        body: {
          payment_id: paymentData.payment_id
        }
      });

      if (statusError) {
        console.error('❌ Erro ao consultar status:', statusError.message);
      } else {
        console.log('✅ Status consultado:', statusData.payment_status);
      }
    }

    // 5. Testar estrutura da tabela bnb20_transactions
    console.log('\n5️⃣ Testando estrutura da tabela bnb20_transactions...');
    const { data: tableData, error: tableError } = await supabase
      .from('bnb20_transactions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError.message);
    } else {
      console.log('✅ Tabela bnb20_transactions acessível');
      console.log('📊 Colunas disponíveis:', tableData.length > 0 ? Object.keys(tableData[0]) : 'Tabela vazia');
    }

    console.log('\n🎉 Teste da integração USDT concluído!');
    console.log('📝 Resumo:');
    console.log('  • Conectividade: ✅');
    console.log('  • Edge Function: ' + (paymentData?.success ? '✅' : '❌'));
    console.log('  • Tabela Database: ' + (tableError ? '❌' : '✅'));

  } catch (error) {
    console.error('💥 Erro crítico no teste:', error);
  }
}

// Executar teste
testUSDTIntegration().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Falha no teste:', error);
  process.exit(1);
});
