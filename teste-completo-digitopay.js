#!/usr/bin/env node

// Teste completo do sistema DigitoPay - ativação automática, webhook e saldo
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testeCompletoDigitoPay() {
  console.log('🔍 TESTE COMPLETO DO SISTEMA DIGITOPAY');
  console.log('=' .repeat(60));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    
    // 1. VERIFICAR STATUS ATUAL DO SISTEMA
    console.log('\n1. 📊 STATUS ATUAL DO SISTEMA...');
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();
    
    const saldoAtual = parseFloat(profile?.balance || '0');
    console.log(`💰 Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`📅 Última atualização: ${new Date(profile?.updated_at).toLocaleString('pt-BR')}`);
    
    // 2. CRIAR NOVA TRANSAÇÃO DE TESTE
    console.log('\n2. 🧪 CRIANDO TRANSAÇÃO DE TESTE...');
    const testTrxId = `test_completo_${Date.now()}`;
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 2.00,
        amount_brl: 2.00,
        person_name: 'Teste Completo DigitoPay',
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
    console.log('📋 Status inicial: pending');
    
    // 3. SIMULAR WEBHOOK DE ATIVAÇÃO AUTOMÁTICA
    console.log('\n3. 🔔 SIMULANDO WEBHOOK DE ATIVAÇÃO AUTOMÁTICA...');
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 2.00,
      person: {
        name: 'Teste Completo DigitoPay',
        cpf: '12345678901'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const startTime = Date.now();
    console.log('📡 Enviando webhook...');
    
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const endTime = Date.now();
    const webhookTime = endTime - startTime;
    
    const webhookResult = await webhookResponse.json();
    console.log(`📡 Webhook processado em ${webhookTime}ms`);
    console.log('📡 Resposta:', webhookResult);
    
    // 4. AGUARDAR PROCESSAMENTO COMPLETO
    console.log('\n4. ⏳ AGUARDANDO PROCESSAMENTO COMPLETO...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 5. VERIFICAR ATIVAÇÃO AUTOMÁTICA
    console.log('\n5. 🔍 VERIFICANDO ATIVAÇÃO AUTOMÁTICA...');
    
    // Verificar saldo após webhook
    const { data: profileAfter } = await supabase
      .from('profiles')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();
    
    const saldoDepois = parseFloat(profileAfter?.balance || '0');
    const diferencaSaldo = saldoDepois - saldoAtual;
    
    console.log(`💰 Saldo antes: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`💰 Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`📈 Diferença: R$ ${diferencaSaldo.toFixed(2)}`);
    
    // Verificar status da transação
    const { data: transaction } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testTrxId)
      .single();
    
    if (transaction) {
      console.log(`📋 Status da transação: ${transaction.status}`);
      console.log(`📋 Tem callback data: ${transaction.callback_data ? '✅' : '❌'}`);
      console.log(`📋 Atualizado em: ${new Date(transaction.updated_at).toLocaleString('pt-BR')}`);
    }
    
    // Verificar se foi registrado na tabela deposits
    const { data: deposits } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (deposits && deposits.length > 0) {
      console.log('💳 Últimos depósitos registrados:');
      deposits.forEach((dep, i) => {
        console.log(`  ${i+1}. R$ ${dep.amount_brl} - ${dep.status} - ${new Date(dep.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    // 6. VERIFICAR LOGS DE WEBHOOK
    console.log('\n6. 📝 VERIFICANDO LOGS DE WEBHOOK...');
    const { data: logs } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const webhookLogs = logs?.filter(log => log.tipo.includes('webhook')) || [];
    console.log(`📊 Últimos ${webhookLogs.length} logs de webhook:`);
    
    webhookLogs.forEach((log, i) => {
      const icon = log.tipo.includes('processed') ? '✅' : 
                   log.tipo.includes('received') ? '📨' : 
                   log.tipo.includes('error') ? '❌' : '📝';
      
      console.log(`  ${i+1}. ${icon} ${log.tipo}`);
      console.log(`     📅 ${new Date(log.created_at).toLocaleString('pt-BR')}`);
      
      if (log.payload?.trxId) {
        console.log(`     🆔 TRX: ${log.payload.trxId}`);
      }
    });
    
    // 7. ANÁLISE COMPLETA DO SISTEMA
    console.log('\n7. 📊 ANÁLISE COMPLETA DO SISTEMA...');
    console.log('=' .repeat(60));
    
    const sistemaStatus = {
      webhookFuncionando: webhookResult.success,
      saldoAtualizado: diferencaSaldo > 0,
      transacaoProcessada: transaction?.status === 'completed',
      depositoRegistrado: deposits && deposits.length > 0,
      callbackDataPresente: transaction?.callback_data ? true : false,
      tempoProcessamento: webhookTime
    };
    
    console.log('📊 Status do Sistema:');
    console.log(`   🔔 Webhook funcionando: ${sistemaStatus.webhookFuncionando ? '✅' : '❌'}`);
    console.log(`   💰 Saldo atualizado: ${sistemaStatus.saldoAtualizado ? '✅' : '❌'}`);
    console.log(`   📋 Transação processada: ${sistemaStatus.transacaoProcessada ? '✅' : '❌'}`);
    console.log(`   💳 Depósito registrado: ${sistemaStatus.depositoRegistrado ? '✅' : '❌'}`);
    console.log(`   🔄 Callback data presente: ${sistemaStatus.callbackDataPresente ? '✅' : '❌'}`);
    console.log(`   ⏱️ Tempo de processamento: ${sistemaStatus.tempoProcessamento}ms`);
    
    // 8. VERIFICAÇÃO ESPECÍFICA DA DIGITOPAY
    console.log('\n8. 🎯 VERIFICAÇÃO ESPECÍFICA DA DIGITOPAY...');
    
    const digitopayStatus = {
      ativacaoAutomatica: sistemaStatus.webhookFuncionando && sistemaStatus.saldoAtualizado,
      webhookRetornando: sistemaStatus.webhookFuncionando && sistemaStatus.callbackDataPresente,
      saldoSubindo: sistemaStatus.saldoAtualizado && sistemaStatus.depositoRegistrado
    };
    
    console.log('🎯 Status DigitoPay:');
    console.log(`   🔄 Ativação automática: ${digitopayStatus.ativacaoAutomatica ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
    console.log(`   📡 Webhook retornando: ${digitopayStatus.webhookRetornando ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
    console.log(`   💰 Saldo subindo na wallet: ${digitopayStatus.saldoSubindo ? '✅ FUNCIONANDO' : '❌ PROBLEMA'}`);
    
    // 9. CONCLUSÃO FINAL
    console.log('\n9. 🎉 CONCLUSÃO FINAL...');
    console.log('=' .repeat(60));
    
    const todosFuncionando = Object.values(digitopayStatus).every(v => v === true);
    
    if (todosFuncionando) {
      console.log('🎉 DIGITOPAY: ✅ 100% FUNCIONANDO!');
      console.log('✅ Ativação automática: OK');
      console.log('✅ Webhook retornando: OK');
      console.log('✅ Saldo subindo na wallet: OK');
      console.log('✅ Sistema completamente operacional');
    } else {
      console.log('⚠️ DIGITOPAY: ⚠️ PROBLEMAS DETECTADOS');
      console.log('❌ Alguns componentes não estão funcionando');
      console.log('🔧 Verificar logs para mais detalhes');
    }
    
    console.log(`\n📊 Resumo da Ativação:`);
    console.log(`   💰 Saldo atualizado: R$ ${diferencaSaldo.toFixed(2)}`);
    console.log(`   ⏱️ Tempo total: ${webhookTime}ms`);
    console.log(`   🔔 Webhook: ${webhookResult.success ? 'Sucesso' : 'Falha'}`);
    console.log(`   📋 Status: ${transaction?.status || 'Desconhecido'}`);
    console.log(`   💳 Depósitos: ${deposits?.length || 0} registrados`);
    
    // 10. RECOMENDAÇÕES
    console.log('\n10. 💡 RECOMENDAÇÕES...');
    
    if (todosFuncionando) {
      console.log('✅ Sistema funcionando perfeitamente!');
      console.log('💡 Para manter a performance:');
      console.log('   1. Monitorar logs regularmente');
      console.log('   2. Verificar saldo periodicamente');
      console.log('   3. Testar webhook ocasionalmente');
    } else {
      console.log('🔧 Para resolver problemas:');
      console.log('   1. Verificar logs de erro');
      console.log('   2. Testar webhook manualmente');
      console.log('   3. Verificar conectividade');
      console.log('   4. Contatar suporte se necessário');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste completo
testeCompletoDigitoPay();
