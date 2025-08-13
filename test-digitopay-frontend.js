// Teste simples da API DigitoPay
import fetch from 'node-fetch';

const DIGITOPAY_CONFIG = {
  baseUrl: 'https://api.digitopayoficial.com.br/api',
  clientId: 'da0cdf6c-06dd-4e04-a046-abd00e8b43ed',
  clientSecret: '3f58b8f4-e101-4076-a844-3a64c7915b1a'
};

async function testDigitoPayConnection() {
  console.log('🔍 Testando conexão com DigitoPay...');
  
  try {
    // Teste de autenticação
    const authResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/token/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: DIGITOPAY_CONFIG.clientId,
        secret: DIGITOPAY_CONFIG.clientSecret
      })
    });

    console.log('📊 Status da autenticação:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Autenticação bem-sucedida!');
      console.log('🔑 Token recebido:', authData.accessToken ? 'Sim' : 'Não');
      
      // Teste de criação de depósito
      const depositData = {
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        paymentOptions: ['PIX'],
        person: {
          cpf: '12345678901',
          name: 'Teste Usuario'
        },
        value: 10.00,
        callbackUrl: 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook'
      };
      
      const depositResponse = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.accessToken}`
        },
        body: JSON.stringify(depositData)
      });
      
      console.log('📊 Status do depósito:', depositResponse.status);
      
      if (depositResponse.ok) {
        const depositResult = await depositResponse.json();
        console.log('✅ Depósito criado com sucesso!');
        console.log('📋 ID do depósito:', depositResult.id);
        console.log('💰 PIX Copia e Cola:', depositResult.pixCopiaECola ? 'Sim' : 'Não');
      } else {
        const errorData = await depositResponse.text();
        console.log('❌ Erro ao criar depósito:', errorData);
      }
      
    } else {
      const errorData = await authResponse.text();
      console.log('❌ Erro na autenticação:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testDigitoPayConnection();