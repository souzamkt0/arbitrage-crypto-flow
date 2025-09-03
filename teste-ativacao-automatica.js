#!/usr/bin/env node

// Teste específico para verificar ativação automática do webhook
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testeAtivacaoAutomatica() {
  console.log('🔍 ANÁLISE PROFUNDA: ATIVAÇÃO AUTOMÁTICA DO WEBHOOK');
  console.log('=' .repeat(60));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    
    // 1. VERIFICAR SALDO ATUAL
    console.log('\n1. 📊 SALDO ATUAL...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();
    
    const saldoAtual = parseFloat(profile?.balance || '0');
    console.log(`💰 Saldo: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`📅 Última atualização: ${new Date(profile?.updated_at).toLocaleString('pt-BR')}`);
    
    // 2. CRIAR NOVA TRANSAÇÃO DE TESTE
    console.log('\n2. 🧪 CRIANDO TRANSAÇÃO DE TESTE...');
    const testTrxId = `test_auto_${Date.now()}`;
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 1.00,
        amount_brl: 1.00,
        person_name: 'Teste Ativação Automática',
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
    
    // 3. AGUARDAR UM POUCO
    console.log('\n3. ⏳ AGUARDANDO 2 SEGUNDOS...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. SIMULAR WEBHOOK AUTOMÁTICO
    console.log('\n4. 🔔 SIMULANDO WEBHOOK AUTOMÁTICO...');
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 1.00,
      person: {
        name: 'Teste Ativação Automática',
        cpf: '12345678901'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📡 Enviando webhook...');
    const startTime = Date.now();
    
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const webhookResult = await webhookResponse.json();
    console.log(`📡 Resposta do webhook (${responseTime}ms):`, webhookResult);
    
    // 5. VERIFICAR ATIVAÇÃO AUTOMÁTICA
    console.log('\n5. 🔍 VERIFICANDO ATIVAÇÃO AUTOMÁTICA...');
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
      .limit(1);
    
    if (deposits && deposits.length > 0) {
      const ultimoDeposito = deposits[0];
      console.log(`💳 Último depósito: R$ ${ultimoDeposito.amount_brl} - ${ultimoDeposito.status}`);
      console.log(`📅 Criado em: ${new Date(ultimoDeposito.created_at).toLocaleString('pt-BR')}`);
    }
    
    // 6. ANÁLISE DE ATIVAÇÃO AUTOMÁTICA
    console.log('\n6. 📊 ANÁLISE DE ATIVAÇÃO AUTOMÁTICA...');
    console.log('=' .repeat(60));
    
    const ativacaoAutomatica = {
      webhookRecebido: webhookResult.success,
      saldoAtualizado: diferencaSaldo > 0,
      transacaoProcessada: transaction?.status === 'completed',
      depositoRegistrado: deposits && deposits.length > 0,
      tempoResposta: responseTime
    };
    
    console.log('📊 Resultados:');
    console.log(`   🔔 Webhook recebido: ${ativacaoAutomatica.webhookRecebido ? '✅' : '❌'}`);
    console.log(`   💰 Saldo atualizado: ${ativacaoAutomatica.saldoAtualizado ? '✅' : '❌'}`);
    console.log(`   📋 Transação processada: ${ativacaoAutomatica.transacaoProcessada ? '✅' : '❌'}`);
    console.log(`   💳 Depósito registrado: ${ativacaoAutomatica.depositoRegistrado ? '✅' : '❌'}`);
    console.log(`   ⏱️ Tempo de resposta: ${ativacaoAutomatica.tempoResposta}ms`);
    
    // 7. VERIFICAR LOGS DE WEBHOOK
    console.log('\n7. 📝 VERIFICANDO LOGS DE WEBHOOK...');
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
    
    // 8. CONCLUSÃO FINAL
    console.log('\n8. 🎯 CONCLUSÃO FINAL...');
    console.log('=' .repeat(60));
    
    const todosFuncionando = Object.values(ativacaoAutomatica).every(v => v === true || (typeof v === 'number' && v < 5000));
    
    if (todosFuncionando) {
      console.log('🎉 ATIVAÇÃO AUTOMÁTICA: ✅ FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Todos os componentes estão operacionais');
      console.log('✅ Webhook processando automaticamente');
      console.log('✅ Saldo atualizando em tempo real');
      console.log('✅ Sistema 100% automático');
    } else {
      console.log('⚠️ ATIVAÇÃO AUTOMÁTICA: ⚠️ PROBLEMAS DETECTADOS');
      console.log('❌ Alguns componentes não estão funcionando corretamente');
      console.log('🔧 Verificar logs para mais detalhes');
    }
    
    console.log(`\n📊 Resumo da Ativação:`);
    console.log(`   💰 Saldo atualizado: R$ ${diferencaSaldo.toFixed(2)}`);
    console.log(`   ⏱️ Tempo total: ${responseTime}ms`);
    console.log(`   🔔 Webhook: ${webhookResult.success ? 'Sucesso' : 'Falha'}`);
    console.log(`   📋 Status: ${transaction?.status || 'Desconhecido'}`);
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testeAtivacaoAutomatica();
