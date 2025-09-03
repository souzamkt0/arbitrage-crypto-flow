#!/usr/bin/env node

// Análise específica da demora no webhook
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analiseDemoraWebhook() {
  console.log('⏱️ ANÁLISE DE DEMORA NO WEBHOOK');
  console.log('=' .repeat(50));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    
    // 1. CRIAR TRANSAÇÃO DE TESTE
    console.log('\n1. 🧪 CRIANDO TRANSAÇÃO DE TESTE...');
    const testTrxId = `test_demora_${Date.now()}`;
    const startCreate = Date.now();
    
    const { data: transactionResult, error: transactionError } = await supabase.functions.invoke('create-digitopay-transaction', {
      body: {
        user_id: userId,
        type: 'deposit',
        amount: 0.50,
        amount_brl: 0.50,
        person_name: 'Teste Demora',
        person_cpf: '12345678901',
        status: 'pending',
        external_id: testTrxId,
        trx_id: testTrxId
      }
    });
    
    const endCreate = Date.now();
    const timeCreate = endCreate - startCreate;
    
    if (transactionError) {
      console.log('❌ Erro ao criar transação:', transactionError);
      return;
    }
    
    console.log(`✅ Transação criada em ${timeCreate}ms`);
    
    // 2. MEDIR TEMPO DE WEBHOOK
    console.log('\n2. ⏱️ MEDINDO TEMPO DE WEBHOOK...');
    const webhookPayload = {
      id: testTrxId,
      status: 'paid',
      value: 0.50,
      person: {
        name: 'Teste Demora',
        cpf: '12345678901'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const startWebhook = Date.now();
    console.log('📡 Enviando webhook...');
    
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const endWebhook = Date.now();
    const timeWebhook = endWebhook - startWebhook;
    
    const webhookResult = await webhookResponse.json();
    console.log(`📡 Webhook processado em ${timeWebhook}ms`);
    console.log('📡 Resposta:', webhookResult);
    
    // 3. AGUARDAR E VERIFICAR PROCESSAMENTO
    console.log('\n3. ⏳ AGUARDANDO PROCESSAMENTO COMPLETO...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. VERIFICAR TEMPOS DE CADA ETAPA
    console.log('\n4. 📊 ANÁLISE DE TEMPOS...');
    
    // Verificar logs de webhook
    const { data: logs } = await supabase
      .from('digitopay_debug')
      .select('*')
      .eq('payload->>trxId', testTrxId)
      .order('created_at', { ascending: true });
    
    if (logs && logs.length >= 2) {
      const received = logs.find(log => log.tipo === 'deposit_webhook_received');
      const processed = logs.find(log => log.tipo === 'deposit_webhook_processed');
      
      if (received && processed) {
        const receivedTime = new Date(received.created_at).getTime();
        const processedTime = new Date(processed.created_at).getTime();
        const processingTime = processedTime - receivedTime;
        
        console.log(`📨 Webhook recebido: ${new Date(received.created_at).toLocaleTimeString('pt-BR')}`);
        console.log(`✅ Webhook processado: ${new Date(processed.created_at).toLocaleTimeString('pt-BR')}`);
        console.log(`⏱️ Tempo de processamento: ${processingTime}ms`);
      }
    }
    
    // 5. VERIFICAR STATUS FINAL
    console.log('\n5. 🔍 VERIFICANDO STATUS FINAL...');
    
    const { data: transaction } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', testTrxId)
      .single();
    
    if (transaction) {
      console.log(`📋 Status: ${transaction.status}`);
      console.log(`📋 Callback: ${transaction.callback_data ? 'Presente' : 'Ausente'}`);
      console.log(`📋 Atualizado: ${new Date(transaction.updated_at).toLocaleString('pt-BR')}`);
    }
    
    // 6. ANÁLISE DE DEMORA
    console.log('\n6. 🔍 ANÁLISE DE DEMORA...');
    console.log('=' .repeat(50));
    
    console.log('📊 Tempos Medidos:');
    console.log(`   🧪 Criação de transação: ${timeCreate}ms`);
    console.log(`   📡 Processamento webhook: ${timeWebhook}ms`);
    console.log(`   ⏱️ Tempo total: ${timeCreate + timeWebhook}ms`);
    
    // Análise de performance
    if (timeWebhook < 2000) {
      console.log('✅ Performance: EXCELENTE (< 2s)');
    } else if (timeWebhook < 5000) {
      console.log('⚠️ Performance: BOA (2-5s)');
    } else if (timeWebhook < 10000) {
      console.log('⚠️ Performance: ACEITÁVEL (5-10s)');
    } else {
      console.log('❌ Performance: LENTA (> 10s)');
    }
    
    // Identificar possíveis gargalos
    console.log('\n🔍 Possíveis Causas da Demora:');
    
    if (timeWebhook > 3000) {
      console.log('   ⚠️ Webhook demorado - possíveis causas:');
      console.log('      - Latência de rede');
      console.log('      - Processamento no Supabase');
      console.log('      - Consultas ao banco de dados');
      console.log('      - Edge Function cold start');
    }
    
    if (timeCreate > 1000) {
      console.log('   ⚠️ Criação de transação demorada - possíveis causas:');
      console.log('      - Edge Function create-digitopay-transaction lenta');
      console.log('      - Problemas de conectividade');
      console.log('      - RLS policies complexas');
    }
    
    // 7. RECOMENDAÇÕES
    console.log('\n7. 💡 RECOMENDAÇÕES...');
    
    if (timeWebhook > 5000) {
      console.log('🔧 Para melhorar performance:');
      console.log('   1. Otimizar consultas no webhook');
      console.log('   2. Implementar cache se necessário');
      console.log('   3. Verificar latência de rede');
      console.log('   4. Considerar processamento assíncrono');
    } else {
      console.log('✅ Performance está dentro do esperado');
      console.log('💡 Para otimizar ainda mais:');
      console.log('   1. Monitorar regularmente');
      console.log('   2. Implementar alertas de performance');
      console.log('   3. Considerar otimizações futuras');
    }
    
    // 8. CONCLUSÃO
    console.log('\n8. 📋 CONCLUSÃO...');
    console.log('=' .repeat(50));
    
    const isAcceptable = timeWebhook < 10000;
    
    if (isAcceptable) {
      console.log('✅ DEMORA: ACEITÁVEL');
      console.log('🎯 O sistema está funcionando dentro dos parâmetros esperados');
      console.log('📊 Tempo de processamento é normal para webhooks');
    } else {
      console.log('⚠️ DEMORA: ATENÇÃO NECESSÁRIA');
      console.log('🔧 Sistema precisa de otimização');
      console.log('📊 Tempo de processamento está acima do esperado');
    }
    
    console.log(`\n📊 Resumo Final:`);
    console.log(`   ⏱️ Tempo total: ${timeCreate + timeWebhook}ms`);
    console.log(`   📡 Webhook: ${timeWebhook}ms`);
    console.log(`   🧪 Criação: ${timeCreate}ms`);
    console.log(`   ✅ Status: ${isAcceptable ? 'Aceitável' : 'Necessita otimização'}`);
    
  } catch (error) {
    console.error('💥 Erro na análise:', error);
  }
}

// Executar análise
analiseDemoraWebhook();
