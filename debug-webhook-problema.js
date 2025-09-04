#!/usr/bin/env node

// Debug detalhado do problema do webhook
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjcxMzg4MywiZXhwIjoyMDY4Mjg5ODgzfQ.YHdYPEU0HwJJnwYAT_bEQ5Jm-wMWcJzTOBhfD6Qz8Kc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugWebhookProblema() {
  console.log('🔍 DEBUG DETALHADO DO PROBLEMA DO WEBHOOK');
  console.log('=' .repeat(60));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    const testTrxId = `debug_${Date.now()}`;
    
    // 1. CRIAR TRANSAÇÃO DE TESTE
    console.log('\n1. 🧪 CRIANDO TRANSAÇÃO DE TESTE...');
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 1.00,
        amount_brl: 1.00,
        person_name: 'Debug Test',
        person_cpf: '12345678901',
        status: 'pending',
        external_id: testTrxId,
        trx_id: testTrxId
      }
    });
    
    if (transactionError) {
      console.log('❌ Erro ao criar transação:', transactionError);
      return;
    }
    
    console.log('✅ Transação criada:', testTrxId);
    
    // 2. VERIFICAR SE A TRANSAÇÃO FOI CRIADA CORRETAMENTE
    console.log('\n2. 🔍 VERIFICANDO TRANSAÇÃO CRIADA...');
    
    const { data: createdTransaction, error: fetchError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testTrxId)
      .single();
    
    if (fetchError || !createdTransaction) {
      console.log('❌ Erro ao buscar transação criada:', fetchError);
      return;
    }
    
    console.log('✅ Transação encontrada no banco:');
    console.log('   ID:', createdTransaction.id);
    console.log('   TRX_ID:', createdTransaction.trx_id);
    console.log('   Status:', createdTransaction.status);
    console.log('   Amount BRL:', createdTransaction.amount_brl);
    console.log('   User ID:', createdTransaction.user_id);
    
    // 3. VERIFICAR SALDO ANTES DO WEBHOOK
    console.log('\n3. 💰 VERIFICANDO SALDO ANTES...');
    
    const { data: profileBefore } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const saldoAntes = parseFloat(profileBefore?.balance || '0');
    console.log('💰 Saldo antes:', saldoAntes);
    
    // 4. SIMULAR WEBHOOK COM PAYLOAD CORRETO
    console.log('\n4. 🔔 SIMULANDO WEBHOOK...');
    
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 1.00,
      person: {
        name: 'Debug Test',
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
    
    const webhookResult = await webhookResponse.json();
    console.log('📡 Resposta do webhook:', webhookResult);
    
    // 5. AGUARDAR PROCESSAMENTO
    console.log('\n5. ⏳ AGUARDANDO PROCESSAMENTO...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. VERIFICAR TODAS AS MUDANÇAS
    console.log('\n6. 🔍 VERIFICANDO MUDANÇAS...');
    
    // Verificar transação atualizada
    const { data: updatedTransaction } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testTrxId)
      .single();
    
    console.log('📋 Status da transação após webhook:');
    console.log('   Status antes:', createdTransaction.status);
    console.log('   Status depois:', updatedTransaction?.status);
    console.log('   Tem callback_data:', updatedTransaction?.callback_data ? '✅' : '❌');
    console.log('   Updated_at mudou:', updatedTransaction?.updated_at !== createdTransaction.updated_at ? '✅' : '❌');
    
    // Verificar saldo atualizado
    const { data: profileAfter } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const saldoDepois = parseFloat(profileAfter?.balance || '0');
    const diferenca = saldoDepois - saldoAntes;
    
    console.log('💰 Saldo após webhook:');
    console.log('   Saldo antes:', saldoAntes);
    console.log('   Saldo depois:', saldoDepois);
    console.log('   Diferença:', diferenca);
    console.log('   Saldo foi atualizado:', diferenca > 0 ? '✅' : '❌');
    
    // Verificar se foi registrado na tabela deposits
    const { data: newDeposits } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
      .order('created_at', { ascending: false });
    
    console.log('💳 Depósitos registrados:');
    console.log('   Quantidade:', newDeposits?.length || 0);
    
    if (newDeposits && newDeposits.length > 0) {
      newDeposits.forEach((dep, i) => {
        console.log(`   ${i+1}. R$ ${dep.amount_brl} - ${dep.status} - ${dep.holder_name}`);
      });
    }
    
    // 7. VERIFICAR LOGS DE DEBUG
    console.log('\n7. 📝 VERIFICANDO LOGS DE DEBUG...');
    
    const { data: debugLogs } = await supabase
      .from('digitopay_debug')
      .select('*')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    console.log('📊 Logs de debug recentes:');
    debugLogs?.forEach((log, i) => {
      console.log(`   ${i+1}. ${log.tipo} - ${new Date(log.created_at).toLocaleTimeString()}`);
      if (log.payload?.trxId === testTrxId) {
        console.log(`      ⭐ Relacionado ao nosso teste: ${testTrxId}`);
      }
    });
    
    // 8. ANÁLISE DO PROBLEMA
    console.log('\n8. 🎯 ANÁLISE DO PROBLEMA...');
    console.log('=' .repeat(60));
    
    const problemas = [];
    const sucessos = [];
    
    // Verificar webhook funcionou
    if (webhookResult.success) {
      sucessos.push('✅ Webhook processou sem erro');
    } else {
      problemas.push('❌ Webhook retornou erro');
    }
    
    // Verificar transação foi atualizada
    if (updatedTransaction?.status === 'completed') {
      sucessos.push('✅ Status da transação foi atualizado para completed');
    } else {
      problemas.push(`❌ Status da transação não foi atualizado (${updatedTransaction?.status})`);
    }
    
    // Verificar callback_data foi salvo
    if (updatedTransaction?.callback_data) {
      sucessos.push('✅ Callback data foi salvo na transação');
    } else {
      problemas.push('❌ Callback data não foi salvo na transação');
    }
    
    // Verificar saldo foi atualizado
    if (diferenca > 0) {
      sucessos.push(`✅ Saldo foi atualizado (+R$ ${diferenca.toFixed(2)})`);
    } else {
      problemas.push('❌ Saldo não foi atualizado');
    }
    
    // Verificar depósito foi registrado
    const depositoRelacionado = newDeposits?.find(d => 
      d.holder_name === 'Debug Test' && 
      parseFloat(d.amount_brl) === 1.00
    );
    
    if (depositoRelacionado) {
      sucessos.push('✅ Depósito foi registrado na tabela deposits');
    } else {
      problemas.push('❌ Depósito não foi registrado na tabela deposits');
    }
    
    console.log('✅ SUCESSOS:');
    sucessos.forEach(s => console.log(`   ${s}`));
    
    console.log('\n❌ PROBLEMAS:');
    problemas.forEach(p => console.log(`   ${p}`));
    
    // 9. DIAGNÓSTICO FINAL
    console.log('\n9. 🏥 DIAGNÓSTICO FINAL...');
    
    if (problemas.length === 0) {
      console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Todos os componentes estão operacionais');
    } else if (sucessos.length > problemas.length) {
      console.log('⚠️ SISTEMA FUNCIONANDO COM PEQUENOS PROBLEMAS');
      console.log(`✅ ${sucessos.length} componentes OK`);
      console.log(`❌ ${problemas.length} componentes com problema`);
    } else {
      console.log('🚨 SISTEMA COM PROBLEMAS SIGNIFICATIVOS');
      console.log(`❌ ${problemas.length} componentes com problema`);
      console.log(`✅ ${sucessos.length} componentes OK`);
    }
    
    // 10. RECOMENDAÇÕES
    console.log('\n10. 💡 RECOMENDAÇÕES...');
    
    if (problemas.some(p => p.includes('transação não foi atualizada'))) {
      console.log('🔧 Problema na atualização da transação:');
      console.log('   - Verificar RLS policies na tabela digitopay_transactions');
      console.log('   - Verificar se o webhook está encontrando a transação correta');
    }
    
    if (problemas.some(p => p.includes('saldo não foi atualizado'))) {
      console.log('🔧 Problema na atualização do saldo:');
      console.log('   - Verificar RLS policies na tabela profiles');
      console.log('   - Verificar se o user_id está correto');
    }
    
    if (problemas.some(p => p.includes('não foi registrado na tabela deposits'))) {
      console.log('🔧 Problema no registro de depósito:');
      console.log('   - Verificar RLS policies na tabela deposits');
      console.log('   - Verificar se todos os campos obrigatórios estão sendo preenchidos');
    }
    
    if (problemas.length === 0) {
      console.log('🎯 Sistema está funcionando perfeitamente!');
      console.log('💡 Para manter a performance:');
      console.log('   - Monitorar logs regularmente');
      console.log('   - Fazer testes periódicos');
      console.log('   - Verificar métricas de performance');
    }
    
  } catch (error) {
    console.error('💥 Erro no debug:', error);
  }
}

// Executar debug
debugWebhookProblema();
