#!/usr/bin/env node

// Teste completo do sistema PIX automático e webhook
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSistemaPixCompleto() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA PIX AUTOMÁTICO');
  console.log('=' .repeat(50));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    
    // 1. VERIFICAR SALDO ATUAL
    console.log('\n1. 📊 VERIFICANDO SALDO ATUAL...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();
    
    const saldoAtual = parseFloat(profile?.balance || '0');
    console.log(`💰 Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`📅 Última atualização: ${profile?.updated_at}`);
    
    // 2. VERIFICAR TRANSAÇÕES RECENTES
    console.log('\n2. 📋 VERIFICANDO TRANSAÇÕES RECENTES...');
    const { data: transacoes } = await supabase
      .from('digitopay_transactions')
      .select('trx_id, amount, amount_brl, status, created_at, updated_at, callback_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 Últimas 5 transações:');
    transacoes?.forEach((trx, i) => {
      const hasCallback = trx.callback_data ? '✅' : '❌';
      const statusIcon = trx.status === 'completed' ? '✅' : 
                        trx.status === 'pending' ? '⏳' : 
                        trx.status === 'cancelled' ? '❌' : '⚠️';
      
      console.log(`  ${i+1}. ${statusIcon} ${trx.trx_id}`);
      console.log(`     💰 R$ ${trx.amount_brl} ($${trx.amount}) - ${trx.status}`);
      console.log(`     📅 ${new Date(trx.created_at).toLocaleString('pt-BR')}`);
      console.log(`     🔔 Webhook: ${hasCallback}`);
      console.log('');
    });
    
    // 3. VERIFICAR DEPÓSITOS REGISTRADOS
    console.log('\n3. 💳 VERIFICANDO DEPÓSITOS REGISTRADOS...');
    const { data: depositos } = await supabase
      .from('deposits')
      .select('amount_brl, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 Últimos 5 depósitos:');
    depositos?.forEach((dep, i) => {
      const statusIcon = dep.status === 'paid' ? '✅' : '⏳';
      console.log(`  ${i+1}. ${statusIcon} R$ ${dep.amount_brl} - ${dep.status}`);
      console.log(`     📅 ${new Date(dep.created_at).toLocaleString('pt-BR')}`);
    });
    
    // 4. VERIFICAR LOGS DE WEBHOOK
    console.log('\n4. 🔔 VERIFICANDO LOGS DE WEBHOOK...');
    const { data: logs } = await supabase
      .from('digitopay_debug')
      .select('tipo, payload, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
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
      if (log.payload?.amount) {
        console.log(`     💰 Valor: R$ ${log.payload.amount}`);
      }
    });
    
    // 5. ANÁLISE DE FUNCIONAMENTO
    console.log('\n5. 🔍 ANÁLISE DE FUNCIONAMENTO...');
    
    const transacoesCompletas = transacoes?.filter(t => t.status === 'completed') || [];
    const transacoesPendentes = transacoes?.filter(t => t.status === 'pending') || [];
    const transacoesComWebhook = transacoes?.filter(t => t.callback_data) || [];
    
    console.log(`📊 Estatísticas:`);
    console.log(`   ✅ Transações completas: ${transacoesCompletas.length}`);
    console.log(`   ⏳ Transações pendentes: ${transacoesPendentes.length}`);
    console.log(`   🔔 Com webhook: ${transacoesComWebhook.length}`);
    console.log(`   📊 Total de transações: ${transacoes?.length || 0}`);
    
    // 6. VERIFICAÇÃO DE PROBLEMAS
    console.log('\n6. ⚠️ VERIFICAÇÃO DE PROBLEMAS...');
    
    if (transacoesPendentes.length > 0) {
      console.log('❌ PROBLEMA: Transações pendentes encontradas:');
      transacoesPendentes.forEach(trx => {
        console.log(`   - ${trx.trx_id} (R$ ${trx.amount_brl})`);
      });
    } else {
      console.log('✅ Nenhuma transação pendente encontrada');
    }
    
    const transacoesSemWebhook = transacoes?.filter(t => t.status === 'completed' && !t.callback_data) || [];
    if (transacoesSemWebhook.length > 0) {
      console.log('⚠️ ATENÇÃO: Transações completas sem webhook:');
      transacoesSemWebhook.forEach(trx => {
        console.log(`   - ${trx.trx_id} (R$ ${trx.amount_brl})`);
      });
    } else {
      console.log('✅ Todas as transações completas têm webhook');
    }
    
    // 7. TESTE DE WEBHOOK
    console.log('\n7. 🧪 TESTE DE WEBHOOK...');
    
    const testTrxId = `test_webhook_${Date.now()}`;
    console.log(`🆔 Testando webhook com ID: ${testTrxId}`);
    
    // Criar transação de teste
    const { data: testTransaction, error: createError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 0.50,
        amount_brl: 0.50,
        person_name: 'Teste Webhook',
        person_cpf: '12345678901',
        status: 'pending',
        external_id: testTrxId,
        trx_id: testTrxId
      }
    });
    
    if (createError) {
      console.log('❌ Erro ao criar transação de teste:', createError);
    } else {
      console.log('✅ Transação de teste criada');
      
      // Simular webhook
      const webhookPayload = {
        id: testTrxId,
        status: 'paid',
        value: 0.50,
        person: { name: 'Teste Webhook', cpf: '12345678901' },
        paymentMethod: { type: 'PIX' },
        type: 'deposit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });
      
      const webhookResult = await webhookResponse.json();
      console.log('📡 Resposta do webhook:', webhookResult);
      
      if (webhookResult.success) {
        console.log('✅ Webhook funcionando corretamente!');
      } else {
        console.log('❌ Problema no webhook:', webhookResult);
      }
    }
    
    // 8. CONCLUSÃO
    console.log('\n8. 📋 CONCLUSÃO...');
    console.log('=' .repeat(50));
    
    const taxaSucesso = transacoes?.length > 0 ? 
      (transacoesCompletas.length / transacoes.length * 100).toFixed(1) : 0;
    
    console.log(`📊 Taxa de sucesso: ${taxaSucesso}%`);
    console.log(`💰 Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
    console.log(`🔔 Webhooks funcionando: ${webhookLogs.length > 0 ? '✅' : '❌'}`);
    
    if (transacoesPendentes.length === 0 && webhookLogs.length > 0) {
      console.log('🎉 SISTEMA PIX AUTOMÁTICO: ✅ FUNCIONANDO!');
    } else {
      console.log('⚠️ SISTEMA PIX AUTOMÁTICO: ⚠️ PROBLEMAS DETECTADOS');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testSistemaPixCompleto();
