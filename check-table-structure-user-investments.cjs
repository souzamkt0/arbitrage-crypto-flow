const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  try {
    console.log('=== Verificando estrutura da tabela user_investments ===');
    
    // Tentar buscar um registro existente para ver a estrutura
    const { data: sample, error: sampleError } = await supabase
      .from('user_investments')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Erro ao buscar amostra:', sampleError);
    } else {
      console.log('Estrutura da tabela (baseada em amostra):');
      if (sample && sample.length > 0) {
        console.log('Colunas disponíveis:', Object.keys(sample[0]));
        console.log('Exemplo de registro:', sample[0]);
      } else {
        console.log('Tabela vazia, tentando inserção de teste...');
        
        // Tentar inserção mínima para descobrir campos obrigatórios
        const { data: testResult, error: testError } = await supabase
          .from('user_investments')
          .insert({
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            investment_plan_id: 1,
            amount: 100
          })
          .select();
        
        if (testError) {
          console.log('Erro na inserção de teste (isso nos ajuda a entender a estrutura):');
          console.log('Código:', testError.code);
          console.log('Mensagem:', testError.message);
          console.log('Detalhes:', testError.details);
        } else {
          console.log('Inserção de teste bem-sucedida:', testResult);
          // Limpar
          await supabase.from('user_investments').delete().eq('id', testResult[0].id);
        }
      }
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

checkTableStructure();