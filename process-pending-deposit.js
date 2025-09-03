#!/usr/bin/env node

// Processar depósito pendente manualmente
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function processPendingDeposit() {
  console.log('🔧 Processando depósito pendente...');
  
  try {
    const userId = '3df866ff-b7f7-4f56-9690-d12ff9c10944';
    const pendingTrxId = 'dep_1756863097471_jsdr6njvi';
    
    // 1. Verificar saldo antes
    console.log('\n1. Verificando saldo antes...');
    const { data: profileBefore } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceBefore = parseFloat(profileBefore?.balance || '0');
    console.log(`💰 Saldo antes: R$ ${balanceBefore}`);
    
    // 2. Simular webhook de aprovação
    console.log('\n2. Simulando webhook de aprovação...');
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
    
    // 3. Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. Verificar saldo depois
    console.log('\n3. Verificando saldo depois...');
    const { data: profileAfter } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const balanceAfter = parseFloat(profileAfter?.balance || '0');
    console.log(`💰 Saldo depois: R$ ${balanceAfter}`);
    console.log(`📈 Diferença: R$ ${balanceAfter - balanceBefore}`);
    
    if (balanceAfter > balanceBefore) {
      console.log('✅ SUCESSO: Depósito processado e saldo atualizado!');
    } else {
      console.log('❌ FALHA: Saldo não foi atualizado!');
    }
    
    // 5. Verificar status da transação
    console.log('\n4. Verificando status da transação...');
    const { data: transaction } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('trx_id', pendingTrxId)
      .single();
    
    if (transaction) {
      console.log('📋 Status da transação:', transaction.status);
      console.log('📋 Callback data:', transaction.callback_data ? 'Presente' : 'Ausente');
    }
    
    // 6. Verificar se apareceu na tabela deposits
    console.log('\n5. Verificando tabela deposits...');
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
    
  } catch (error) {
    console.error('💥 Erro no processamento:', error);
  }
}

// Executar processamento
processPendingDeposit();
