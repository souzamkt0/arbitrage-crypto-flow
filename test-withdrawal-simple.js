// Script para testar a Edge Function digitopay-withdrawal de forma simples
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimple() {
  try {
    console.log('🧪 Testando Edge Function digitopay-withdrawal de forma simples...');
    
    // Dados de teste simples - não precisamos que o withdrawal exista
    const testData = {
      withdrawalId: 'test-123',
      amount: 100.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'EMAIL',
      holderName: 'Teste Usuario',
      cpf: '12345678901'
    };

    console.log('📋 Dados de teste:', testData);

    // Chamar a Edge Function digitopay-withdrawal
    console.log('🚀 Chamando Edge Function digitopay-withdrawal...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/digitopay-withdrawal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📋 Corpo da resposta (texto):', responseText);

    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('✅ Edge Function executada com sucesso:', responseData);
      } catch (e) {
        console.log('✅ Resposta recebida (não é JSON válido):', responseText);
      }
    } else {
      console.error('❌ Erro na Edge Function - Status:', response.status);
      console.error('❌ Corpo da resposta de erro:', responseText);
    }

    // Verificar logs de debug
    console.log('📋 Verificando logs de debug...');
    const { data: debugLogs, error: debugError } = await supabase
      .from('digitopay_debug')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (debugError) {
      console.error('❌ Erro ao buscar logs de debug:', debugError);
    } else {
      console.log('📋 Logs de debug recentes:', debugLogs);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testSimple();