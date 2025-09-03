#!/usr/bin/env node

// Processar depósito pendente encontrado
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function processarDepositoPendente() {
  console.log('🔧 PROCESSANDO DEPÓSITO PENDENTE...');
  console.log('=' .repeat(50));
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    const pendingTrxId = 'dep_1756861652515_j495w36ys';
    
    // 1. Verificar saldo antes
    console.log('\n1. 📊 VERIFICANDO SALDO ANTES...');
    const { data: profileBefore } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceBefore = parseFloat(profileBefore?.balance || '0');
    console.log(`💰 Saldo antes: R$ ${balanceBefore.toFixed(2)}`);
    
    // 2. Simular webhook de aprovação
    console.log('\n2. 🔔 SIMULANDO WEBHOOK DE APROVAÇÃO...');
    const webhookPayload = {
      id: pendingTrxId,
      status: 'paid',
      value: 1.00,
      person: {
        name: 'Administrador',
        cpf: '09822837410'
      },
      paymentMethod: {
        type: 'PIX'
      },
      type: 'deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📡 Enviando webhook...');
    const webhookResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const webhookResult = await webhookResponse.json();
    console.log('📡 Resposta do webhook:', webhookResult);
    
    // 3. Aguardar processamento
    console.log('\n3. ⏳ AGUARDANDO PROCESSAMENTO...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. Verificar saldo depois
    console.log('\n4. 📊 VERIFICANDO SALDO DEPOIS...');
    const { data: profileAfter } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceAfter = parseFloat(profileAfter?.balance || '0');
    console.log(`💰 Saldo depois: R$ ${balanceAfter.toFixed(2)}`);
    console.log(`📈 Diferença: R$ ${(balanceAfter - balanceBefore).toFixed(2)}`);
    
    if (balanceAfter > balanceBefore) {
      console.log('✅ SUCESSO: Depósito processado e saldo atualizado!');
    } else {
      console.log('❌ FALHA: Saldo não foi atualizado!');
    }
    
    // 5. Verificar status da transação
    console.log('\n5. 📋 VERIFICANDO STATUS DA TRANSAÇÃO...');
    const { data: transaction } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', pendingTrxId)
      .single();
    
    if (transaction) {
      console.log(`📋 Status: ${transaction.status}`);
      console.log(`📋 Callback data: ${transaction.callback_data ? 'Presente' : 'Ausente'}`);
      console.log(`📋 Atualizado em: ${new Date(transaction.updated_at).toLocaleString('pt-BR')}`);
    }
    
    // 6. Verificar depósitos registrados
    console.log('\n6. 💳 VERIFICANDO DEPÓSITOS REGISTRADOS...');
    const { data: deposits } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (deposits && deposits.length > 0) {
      console.log('✅ Últimos depósitos:');
      deposits.forEach((dep, i) => {
        console.log(`  ${i+1}. R$ ${dep.amount_brl} - ${dep.status} - ${new Date(dep.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    // 7. Verificar logs de webhook
    console.log('\n7. 🔔 VERIFICANDO LOGS DE WEBHOOK...');
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
    });
    
    // 8. CONCLUSÃO
    console.log('\n8. 📋 CONCLUSÃO...');
    console.log('=' .repeat(50));
    
    if (webhookResult.success && balanceAfter > balanceBefore) {
      console.log('🎉 DEPÓSITO PROCESSADO COM SUCESSO!');
      console.log(`💰 Saldo atualizado: R$ ${balanceBefore.toFixed(2)} → R$ ${balanceAfter.toFixed(2)}`);
      console.log('✅ Sistema PIX automático funcionando!');
    } else {
      console.log('❌ PROBLEMA NO PROCESSAMENTO');
      console.log('⚠️ Verificar logs para mais detalhes');
    }
    
  } catch (error) {
    console.error('💥 Erro no processamento:', error);
  }
}

// Executar processamento
processarDepositoPendente();
