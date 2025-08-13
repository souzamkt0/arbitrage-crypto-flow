// Script para testar apenas a autenticação do DigitoPay

async function testDigitoPayAuth() {
  try {
    console.log('🔐 Testando autenticação DigitoPay...');
    
    const digitopayApiUrl = 'https://api.digitopayoficial.com.br/api';
    const digitopayClientId = 'da0cdf6c-06dd-4e04-a046-abd00e8b43ed';
    const digitopayClientSecret = '3f58b8f4-e101-4076-a844-3a64c7915b1a';
    
    console.log('📋 Dados de autenticação:');
    console.log('- API URL:', digitopayApiUrl);
    console.log('- Client ID:', digitopayClientId);
    console.log('- Client Secret:', digitopayClientSecret.substring(0, 8) + '...');
    
    // Testar o endpoint correto baseado na documentação
    const endpoint = '/token/api';
    console.log(`🔍 Testando endpoint correto: ${digitopayApiUrl}${endpoint}`);
    
    try {
      const authResponse = await fetch(`${digitopayApiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DigitoPay-Client/1.0'
        },
        body: JSON.stringify({
          clientId: digitopayClientId,
          secret: digitopayClientSecret
        })
      });
        
      console.log('📊 Status da resposta:', authResponse.status);
      console.log('📊 Status text:', authResponse.statusText);
      
      const responseText = await authResponse.text();
      console.log('📋 Resposta completa:', responseText);
      
      if (authResponse.ok) {
        const authData = JSON.parse(responseText);
        console.log('✅ Autenticação bem-sucedida!');
        console.log('🔑 Token recebido:', authData.accessToken ? 'Sim' : 'Não');
        if (authData.accessToken) {
          console.log('🔑 Token:', authData.accessToken.substring(0, 20) + '...');
        }
      } else {
        console.log('❌ Falhou na autenticação - Status:', authResponse.status);
      }
    } catch (error) {
      console.log('❌ Erro na autenticação:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testDigitoPayAuth();