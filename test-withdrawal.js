// Teste da Edge Function digitopay-create-withdrawal
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithdrawal() {
  try {
    console.log('🧪 Testando Edge Function digitopay-create-withdrawal...');
    
    const response = await supabase.functions.invoke('digitopay-create-withdrawal', {
      body: {
        amount: 10.00,
        cpf: '12345678901',
        name: 'Teste Usuario',
        pixKey: 'teste@email.com',
        pixKeyType: 'EMAIL',
        callbackUrl: 'http://localhost:8080/api/digitopay/webhook/withdrawal',
        description: 'Teste de saque'
      }
    });

    console.log('📡 Resposta da Edge Function:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error('❌ Erro na Edge Function:', response.error);
    } else {
      console.log('✅ Edge Function funcionando!');
    }
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testWithdrawal();