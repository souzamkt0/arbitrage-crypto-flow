#!/usr/bin/env node

// Testar as Edge Functions específicas que estão dando 404
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarEdgeFunctions() {
  console.log('🔍 TESTANDO EDGE FUNCTIONS ESPECÍFICAS');
  console.log('=' .repeat(60));
  
  const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
  const testTrxId = `test_edge_${Date.now()}`;
  
  // 1. TESTAR digitopay-deposit-webhook
  console.log('\n1. 🔔 TESTANDO digitopay-deposit-webhook...');
  
  try {
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 1.00,
      person: {
        name: 'Teste Edge Function',
        cpf: '12345678901'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📡 Payload do webhook:', JSON.stringify(webhookPayload, null, 2));
    
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('📊 Status da resposta webhook:', webhookResponse.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(webhookResponse.headers.entries()));
    
    if (webhookResponse.ok) {
      const webhookResult = await webhookResponse.json();
      console.log('✅ digitopay-deposit-webhook FUNCIONANDO:', webhookResult);
    } else {
      const errorText = await webhookResponse.text();
      console.log('❌ digitopay-deposit-webhook ERRO:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro ao testar webhook:', error.message);
  }
  
  // 2. TESTAR digitopay-status
  console.log('\n2. 🔍 TESTANDO digitopay-status...');
  
  try {
    const statusPayload = {
      trxId: testTrxId
    };
    
    const { data: statusResult, error: statusError } = await supabase.functions.invoke('digitopay-status', {
      body: statusPayload
    });
    
    if (statusError) {
      console.log('❌ digitopay-status ERRO:', statusError);
    } else {
      console.log('✅ digitopay-status FUNCIONANDO:', statusResult);
    }
  } catch (error) {
    console.log('❌ Erro ao testar status:', error.message);
  }
  
  // 3. TESTAR create-digitopay-transaction
  console.log('\n3. 💰 TESTANDO create-digitopay-transaction...');
  
  try {
    const transactionPayload = {
      user_id: userId,
      type: 'deposit',
      amount: 1.00,
      amount_brl: 1.00,
      person_name: 'Teste Edge Function',
      person_cpf: '12345678901',
      external_id: testTrxId,
      trx_id: testTrxId
    };
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: transactionPayload
    });
    
    if (transactionError) {
      console.log('❌ create-digitopay-transaction ERRO:', transactionError);
    } else {
      console.log('✅ create-digitopay-transaction FUNCIONANDO:', transactionResult);
    }
  } catch (error) {
    console.log('❌ Erro ao testar create-transaction:', error.message);
  }
  
  // 4. VERIFICAR TRANSAÇÕES CRIADAS
  console.log('\n4. 📊 VERIFICANDO TRANSAÇÕES CRIADAS...');
  
  try {
    const { data: transactions, error } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Erro ao buscar transações:', error);
    } else {
      console.log(`📊 Encontradas ${transactions.length} transações recentes:`);
      transactions.forEach((tx, i) => {
        console.log(`  ${i+1}. ${tx.trx_id} - ${tx.status} - R$ ${tx.amount_brl}`);
      });
    }
  } catch (error) {
    console.log('❌ Erro ao verificar transações:', error.message);
  }
  
  // 5. VERIFICAR LOGS DE DEBUG
  console.log('\n5. 📝 VERIFICANDO LOGS DE DEBUG...');
  
  try {
    const { data: logs, error } = await supabase
      .from('digitopay_debug')
      .select('*')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ Erro ao buscar logs:', error);
    } else {
      console.log(`📊 Encontrados ${logs.length} logs recentes:`);
      logs.forEach((log, i) => {
        console.log(`  ${i+1}. ${log.tipo} - ${new Date(log.created_at).toLocaleTimeString()}`);
      });
    }
  } catch (error) {
    console.log('❌ Erro ao verificar logs:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 DIAGNÓSTICO FINAL');
  console.log('=' .repeat(60));
  
  console.log('Edge Functions testadas:');
  console.log('  - digitopay-deposit-webhook: Testada via fetch direto');
  console.log('  - digitopay-status: Testada via supabase.functions.invoke');
  console.log('  - create-digitopay-transaction: Testada via supabase.functions.invoke');
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Se alguma função deu 404, ela precisa ser re-deployada');
  console.log('2. Verificar se o sistema de verificação automática está funcionando');
  console.log('3. Testar com uma transação real');
}

// Executar teste
testarEdgeFunctions();

