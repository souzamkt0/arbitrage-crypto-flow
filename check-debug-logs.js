// Script para verificar logs de debug do DigitoPay
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDebugLogs() {
  try {
    console.log('🔍 Verificando logs de debug...');
    
    // Buscar logs de erro recentes
    const { data: errorLogs, error: errorLogsError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .eq('tipo', 'withdrawal_error')
      .order('created_at', { ascending: false })
      .limit(5);

    if (errorLogsError) {
      console.error('❌ Erro ao buscar logs de erro:', errorLogsError);
    } else {
      console.log('📋 Logs de erro recentes:');
      errorLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.created_at}`);
        console.log('Payload:', JSON.stringify(log.payload, null, 2));
      });
    }

    // Buscar todos os logs recentes
    const { data: allLogs, error: allLogsError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allLogsError) {
      console.error('❌ Erro ao buscar todos os logs:', allLogsError);
    } else {
      console.log('\n📋 Todos os logs recentes:');
      allLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. [${log.tipo}] ${log.created_at}`);
        console.log('Payload:', JSON.stringify(log.payload, null, 2));
      });
    }

  } catch (error) {
    console.error('💥 Erro no script:', error);
  }
}

checkDebugLogs();