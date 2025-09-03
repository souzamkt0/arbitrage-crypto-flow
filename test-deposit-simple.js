#!/usr/bin/env node

// Teste simples do webhook de depósito DigitoPay
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDepositWebhook() {
  console.log('🧪 Testando webhook de depósito...');
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    
    // 1. Verificar saldo antes
    console.log('\n1. Verificando saldo antes...');
    const { data: profileBefore } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceBefore = parseFloat(profileBefore?.balance || '0');
    console.log(`💰 Saldo antes: R$ ${balanceBefore}`);
    
    // 2. Criar transação via Edge Function
    console.log('\n2. Criando transação via Edge Function...');
    const testTrxId = `test_${Date.now()}`;
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 25.00,
        amount_brl: 25.00,
        person_name: 'Teste Webhook',
        person_cpf: '12345678901',
        status: 'pending',
        external_id: testTrxId,
        trx_id: testTrxId
      }
    });
    
    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError);
      return;
    }
    
    console.log('✅ Transação criada via Edge Function:', transactionResult);
    
    // 3. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Simular webhook de aprovação
    console.log('\n3. Simulando webhook de aprovação...');
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 25.00,
      person: {
        name: 'Teste Webhook',
        cpf: '12345678901'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Chamar webhook diretamente
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const webhookResult = await webhookResponse.json();
    console.log('📡 Resposta do webhook:', webhookResult);
    
    // 5. Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Verificar saldo depois
    console.log('\n4. Verificando saldo depois...');
    const { data: profileAfter } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceAfter = parseFloat(profileAfter?.balance || '0');
    console.log(`💰 Saldo depois: R$ ${balanceAfter}`);
    console.log(`📈 Diferença: R$ ${balanceAfter - balanceBefore}`);
    
    if (balanceAfter > balanceBefore) {
      console.log('✅ SUCESSO: Saldo foi atualizado automaticamente!');
    } else {
      console.log('❌ FALHA: Saldo não foi atualizado!');
    }
    
    // 7. Verificar se apareceu na tabela deposits
    console.log('\n5. Verificando tabela deposits...');
    const { data: deposits } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (deposits && deposits.length > 0) {
      console.log('✅ Últimos depósitos encontrados:');
      deposits.forEach((dep, i) => {
        console.log(`  ${i+1}. R$ ${dep.amount_brl} - ${dep.status} - ${new Date(dep.created_at).toLocaleString('pt-BR')}`);
      });
    } else {
      console.log('❌ Nenhum depósito encontrado na tabela deposits');
    }
    
    // 8. Verificar transações digitopay
    console.log('\n6. Verificando transações DigitoPay...');
    const { data: digitopayTransactions } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (digitopayTransactions && digitopayTransactions.length > 0) {
      console.log('✅ Últimas transações DigitoPay:');
      digitopayTransactions.forEach((trx, i) => {
        console.log(`  ${i+1}. R$ ${trx.amount_brl} - ${trx.status} - ${trx.trx_id}`);
      });
    } else {
      console.log('❌ Nenhuma transação DigitoPay encontrada');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testDepositWebhook();
