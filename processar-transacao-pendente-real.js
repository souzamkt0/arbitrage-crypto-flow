#!/usr/bin/env node

// Processar a transação pendente real do usuário
const trxId = 'dep_1757030139456_t0w32oohm';
const amount = 5.85;

console.log('🔧 PROCESSANDO TRANSAÇÃO PENDENTE REAL');
console.log('=' .repeat(60));
console.log('📋 Transação:', trxId);
console.log('💰 Valor:', `R$ ${amount}`);

// Simular webhook do DigitoPay
const webhookPayload = {
  id: trxId,
  status: 'paid',
  value: amount,
  person: {
    name: 'Administrador',
    cpf: '00000000000'
  },
  paymentMethod: {
    type: 'PIX'
  },
  type: 'deposit',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('\n📡 Enviando webhook simulado...');
console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));

fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookPayload)
})
.then(async response => {
  console.log('\n📊 Status da resposta:', response.status);
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO!');
    console.log('📄 Resposta:', JSON.stringify(result, null, 2));
    console.log('\n🎉 A transação deve estar ativa agora!');
    console.log('💰 O saldo do usuário deve ter sido creditado automaticamente!');
  } else {
    const errorText = await response.text();
    console.log('❌ ERRO NO WEBHOOK:', errorText);
    
    // Se deu 404, a função não existe - vamos tentar o webhook genérico
    if (response.status === 404) {
      console.log('\n🔄 Tentando webhook genérico...');
      
      const genericResponse = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      });
      
      console.log('📊 Status webhook genérico:', genericResponse.status);
      
      if (genericResponse.ok) {
        const genericResult = await genericResponse.json();
        console.log('✅ WEBHOOK GENÉRICO FUNCIONOU!');
        console.log('📄 Resposta:', JSON.stringify(genericResult, null, 2));
      } else {
        const genericError = await genericResponse.text();
        console.log('❌ Erro webhook genérico:', genericError);
      }
    }
  }
})
.catch(error => {
  console.log('❌ Erro de rede:', error.message);
});

