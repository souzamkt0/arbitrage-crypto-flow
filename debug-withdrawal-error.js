// Script de Debug para Erro de Saque no Supabase
// Execute este script para diagnosticar o problema

console.log('🔍 DEBUG: Erro ao salvar saque no Supabase');
console.log('==========================================');

// Possíveis causas do erro:
console.log('\n📋 POSSÍVEIS CAUSAS DO ERRO:');
console.log('1. Docker não está rodando (Supabase local)');
console.log('2. Tabela withdrawals não existe ou estrutura incorreta');
console.log('3. Políticas RLS bloqueando a inserção');
console.log('4. Campos obrigatórios não preenchidos');
console.log('5. Tipos de dados incompatíveis');
console.log('6. Conexão com Supabase remoto com problemas');

// Soluções recomendadas:
console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
console.log('\n1. VERIFICAR DOCKER E SUPABASE LOCAL:');
console.log('   - Instalar Docker Desktop');
console.log('   - Executar: npx supabase start');
console.log('   - Verificar se todas as migrações foram aplicadas');

console.log('\n2. VERIFICAR ESTRUTURA DA TABELA:');
console.log('   - Confirmar se tabela withdrawals existe');
console.log('   - Verificar se todas as colunas estão presentes');
console.log('   - Confirmar tipos de dados corretos');

console.log('\n3. VERIFICAR POLÍTICAS RLS:');
console.log('   - Confirmar se usuário tem permissão para inserir');
console.log('   - Verificar se auth.uid() está funcionando');
console.log('   - Testar com usuário administrador');

console.log('\n4. VERIFICAR DADOS DE ENTRADA:');
console.log('   - Confirmar se user.id não é null');
console.log('   - Verificar se valores numéricos são válidos');
console.log('   - Confirmar se strings não excedem limites');

console.log('\n5. VERIFICAR CONEXÃO SUPABASE:');
console.log('   - Confirmar URL e chave anon no .env');
console.log('   - Testar conexão com Supabase remoto');
console.log('   - Verificar se projeto está ativo');

// Comandos para debug:
console.log('\n⚡ COMANDOS PARA DEBUG:');
console.log('\n# Verificar status do Docker:');
console.log('docker --version');
console.log('docker ps');

console.log('\n# Iniciar Supabase local:');
console.log('npx supabase start');
console.log('npx supabase status');

console.log('\n# Verificar migrações:');
console.log('npx supabase db reset');
console.log('npx supabase migration list');

console.log('\n# Testar conexão:');
console.log('npx supabase db shell');
console.log('SELECT * FROM withdrawals LIMIT 1;');

// Exemplo de dados corretos:
console.log('\n📊 EXEMPLO DE DADOS CORRETOS:');
const exemploSaque = {
  user_id: 'uuid-do-usuario',
  amount_usd: 50.00,
  amount_brl: 50.00,
  type: 'pix',
  status: 'pending',
  holder_name: 'Nome do Usuário',
  cpf: '12345678901',
  pix_key_type: 'cpf',
  pix_key: '123.456.789-01',
  fee: 1.00,
  net_amount: 49.00,
  exchange_rate: 1
};
console.log(JSON.stringify(exemploSaque, null, 2));

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Abrir console do navegador (F12)');
console.log('2. Tentar fazer um saque');
console.log('3. Verificar logs detalhados no console');
console.log('4. Copiar mensagem de erro completa');
console.log('5. Aplicar solução específica baseada no erro');

console.log('\n✅ SISTEMA ATUALIZADO COM:');
console.log('- Logs detalhados de erro');
console.log('- Correção do holder_name');
console.log('- Correção da referência user_id na tabela profiles');
console.log('- Validações aprimoradas');

console.log('\n🔗 Aplicação: http://localhost:8080/');
console.log('==========================================');