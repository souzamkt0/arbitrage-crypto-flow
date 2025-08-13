// Teste da integração DigitoPay no frontend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDigitoPayIntegration() {
  console.log('🔍 Testando integração DigitoPay via Supabase...');
  
  try {
    // Testar autenticação
    console.log('🔐 Testando autenticação...');
    const authResponse = await supabase.functions.invoke('digitopay-auth', {
      body: {}
    });
    
    console.log('📡 Resposta da autenticação:', authResponse);
    
    if (authResponse.error) {
      console.log('❌ Erro na autenticação:', authResponse.error);
      return;
    }
    
    if (authResponse.data && authResponse.data.success) {
      console.log('✅ Autenticação bem-sucedida!');
      console.log('🔑 Token recebido:', authResponse.data.accessToken ? 'Sim' : 'Não');
      
      // Testar criação de depósito
      console.log('💰 Testando criação de depósito...');
      const depositResponse = await supabase.functions.invoke('digitopay-deposit', {
        body: {
          amount: 10.00,
          cpf: '11144477735', // CPF válido para teste
          name: 'Teste Usuario',
          callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook'
        }
      });
      
      console.log('📡 Resposta do depósito:', depositResponse);
      
      if (depositResponse.error) {
        console.log('❌ Erro no depósito:', depositResponse.error);
      } else if (depositResponse.data && depositResponse.data.success) {
        console.log('✅ Depósito criado com sucesso!');
        console.log('📋 ID do depósito:', depositResponse.data.id);
        console.log('💰 PIX Copia e Cola:', depositResponse.data.pixCopiaECola ? 'Sim' : 'Não');
      } else {
        console.log('❌ Falha na criação do depósito:', depositResponse.data);
      }
    } else {
      console.log('❌ Falha na autenticação:', authResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erro na integração:', error);
  }
}

testDigitoPayIntegration();