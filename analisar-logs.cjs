const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analisarLogs() {
  console.log('🔍 Analisando logs detalhadamente...\n');

  try {
    // 1. Verificar todos os tipos de logs
    console.log('📋 1. Tipos de logs encontrados...');
    
    const { data: tipos, error: tiposError } = await supabase
      .from('digitopay_debug')
      .select('tipo')
      .order('created_at', { ascending: false });

    if (tiposError) {
      console.error('❌ Erro ao verificar tipos:', tiposError);
    } else {
      const tiposUnicos = [...new Set(tipos.map(t => t.tipo))];
      console.log('✅ Tipos de logs:', tiposUnicos);
    }

    // 2. Verificar logs de webhook
    console.log('\n🔔 2. Logs de webhook...');
    
    const { data: webhookLogs, error: webhookError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .or('tipo.eq.webhook_received,tipo.eq.deposit_webhook_received,tipo.eq.webhook_proxy_received')
      .order('created_at', { ascending: false })
      .limit(10);

    if (webhookError) {
      console.error('❌ Erro ao verificar webhooks:', webhookError);
    } else {
      console.log(`✅ Logs de webhook encontrados: ${webhookLogs?.length || 0}`);
      if (webhookLogs && webhookLogs.length > 0) {
        webhookLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.tipo} - ${log.created_at}`);
          console.log(`     Payload: ${JSON.stringify(log.payload).substring(0, 200)}...`);
        });
      } else {
        console.log('❌ NENHUM WEBHOOK RECEBIDO!');
      }
    }

    // 3. Verificar transações pendentes
    console.log('\n⏳ 3. Transações pendentes...');
    
    const { data: pendingTrans, error: pendingError } = await supabase
      .from('digitopay_transactions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Erro ao verificar pendentes:', pendingError);
    } else {
      console.log(`✅ Transações pendentes: ${pendingTrans?.length || 0}`);
      if (pendingTrans && pendingTrans.length > 0) {
        pendingTrans.forEach((tx, index) => {
          console.log(`  ${index + 1}. ${tx.trx_id} - R$ ${tx.amount_brl} - ${tx.created_at}`);
        });
      } else {
        console.log('❌ NENHUMA TRANSAÇÃO PENDENTE!');
      }
    }

    // 4. Verificar depósitos pendentes
    console.log('\n💰 4. Depósitos pendentes...');
    
    const { data: pendingDeposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error('❌ Erro ao verificar depósitos pendentes:', depositsError);
    } else {
      console.log(`✅ Depósitos pendentes: ${pendingDeposits?.length || 0}`);
      if (pendingDeposits && pendingDeposits.length > 0) {
        pendingDeposits.forEach((dep, index) => {
          console.log(`  ${index + 1}. R$ ${dep.amount_brl} - ${dep.created_at}`);
        });
      } else {
        console.log('❌ NENHUM DEPÓSITO PENDENTE!');
      }
    }

    // 5. Verificar logs de criação de depósito
    console.log('\n🚀 5. Logs de criação de depósito...');
    
    const { data: createLogs, error: createError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .or('tipo.eq.createDeposit,tipo.eq.deposit_created')
      .order('created_at', { ascending: false })
      .limit(5);

    if (createError) {
      console.error('❌ Erro ao verificar criação:', createError);
    } else {
      console.log(`✅ Logs de criação: ${createLogs?.length || 0}`);
      if (createLogs && createLogs.length > 0) {
        createLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.tipo} - ${log.created_at}`);
          console.log(`     Payload: ${JSON.stringify(log.payload).substring(0, 200)}...`);
        });
      } else {
        console.log('❌ NENHUM LOG DE CRIAÇÃO ENCONTRADO!');
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

analisarLogs();
