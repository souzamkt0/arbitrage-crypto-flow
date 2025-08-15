const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migração da tabela user_data...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250115000001_create_user_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado');
    console.log('📝 Conteúdo da migração:');
    console.log(migrationSQL);
    
    // Executar a migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      return;
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    console.log('📊 Resultado:', data);
    
    // Verificar se a tabela foi criada
    const { data: tableCheck, error: checkError } = await supabase
      .from('user_data')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('⚠️  Erro ao verificar tabela (pode ser normal se estiver vazia):', checkError.message);
    } else {
      console.log('✅ Tabela user_data criada e acessível!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a migração
applyMigration();

module.exports = { applyMigration };