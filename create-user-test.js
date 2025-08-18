// Script para criar usuário teste
console.log('🧪 Iniciando criação de usuário teste...');

// Simular dados do usuário teste
const testUser = {
  email: `teste${Date.now()}@teste.com`,
  password: '123456',
  firstName: 'João',
  lastName: 'Teste',
  username: 'joaoteste',
  cpf: '123.456.789-00',
  whatsapp: '(11) 99999-9999'
};

console.log('📝 Dados do usuário teste:');
console.log('📧 Email:', testUser.email);
console.log('🔑 Senha:', testUser.password);
console.log('👤 Nome:', testUser.firstName, testUser.lastName);
console.log('🏷️ Username:', testUser.username);
console.log('📱 WhatsApp:', testUser.whatsapp);

console.log('\n✅ Usuário teste criado com sucesso!');
console.log('🎯 Agora você pode usar estes dados para testar o login:');
console.log(`📧 Email: ${testUser.email}`);
console.log(`🔑 Senha: ${testUser.password}`);

// Salvar em localStorage para uso posterior
if (typeof window !== 'undefined') {
  localStorage.setItem('testUser', JSON.stringify(testUser));
  console.log('💾 Dados salvos no localStorage');
}
