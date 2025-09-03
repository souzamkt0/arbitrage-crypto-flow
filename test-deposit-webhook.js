#!/usr/bin/env node

// Teste completo do webhook de depósito DigitoPay
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDepositWebhook() {
  console.log('🧪 Iniciando teste completo do webhook de depósito...');
  
  try {
    // 1. Criar uma transação de teste
    console.log('\n1. Criando transação de teste...');
    const testTrxId = `test_${Date.now()}`;
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944'; // Admin user
    
    const { data: transaction, error: createError } = await supabase
      .from('digitopay_transactions')
      .insert({
        user_id: userId,
        trx_id: testTrxId,
        type: 'deposit',
        amount: 50.00,
        amount_brl: 50.00,
        status: 'pending',
        person_name: 'Teste Webhook',
        person_cpf: '12345678901'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar transação:', createError);
      return;
    }
    
    console.log('✅ Transação criada:', transaction);
    
    // 2. Verificar saldo antes
    console.log('\n2. Verificando saldo antes...');
    const { data: profileBefore, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    const balanceBefore = parseFloat(profileBefore.balance || '0');
    console.log(`💰 Saldo antes: R$ ${balanceBefore}`);
    
    // 3. Simular webhook do DigitoPay
    console.log('\n3. Simulando webhook de aprovação...');
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 50.00,
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
    
    // Chamar a Edge Function do webhook
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const webhookResult = await webhookResponse.json();
    console.log('📡 Resposta do webhook:', webhookResult);
    
    // 4. Aguardar processamento
    console.log('\n4. Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Verificar se a transação foi atualizada
    console.log('\n5. Verificando transação atualizada...');
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testTrxId)
      .single();
    
    if (updateError) {
      console.error('❌ Erro ao buscar transação atualizada:', updateError);
    } else {
      console.log('📋 Transação atualizada:', updatedTransaction);
    }
    
    // 6. Verificar saldo depois
    console.log('\n6. Verificando saldo depois...');
    const { data: profileAfter, error: profileAfterError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (profileAfterError) {
      console.error('❌ Erro ao buscar perfil depois:', profileAfterError);
    } else {
      const balanceAfter = parseFloat(profileAfter.balance || '0');
      console.log(`💰 Saldo depois: R$ ${balanceAfter}`);
      console.log(`📈 Diferença: R$ ${balanceAfter - balanceBefore}`);
      
      if (balanceAfter > balanceBefore) {
        console.log('✅ SUCESSO: Saldo foi atualizado automaticamente!');
      } else {
        console.log('❌ FALHA: Saldo não foi atualizado!');
      }
    }
    
    // 7. Verificar se apareceu na tabela deposits
    console.log('\n7. Verificando tabela deposits...');
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (depositsError) {
      console.error('❌ Erro ao buscar deposits:', depositsError);
    } else if (deposits && deposits.length > 0) {
      console.log('✅ Depósito registrado na tabela deposits:', deposits[0]);
    } else {
      console.log('❌ Depósito não encontrado na tabela deposits');
    }
    
    // 8. Verificar logs de debug
    console.log('\n8. Verificando logs de debug...');
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (debugError) {
      console.error('❌ Erro ao buscar logs:', debugError);
    } else {
      console.log('📝 Últimos logs:', debugLogs);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testDepositWebhook();
