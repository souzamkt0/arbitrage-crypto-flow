#!/usr/bin/env node

/**
 * Script para automatizar alterações de colunas no Supabase
 * Uso: node scripts/migrate-supabase.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').split('.')[0];
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createMigrationFile(name, sql) {
  const timestamp = generateTimestamp();
  const uuid = generateUUID();
  const filename = `${timestamp}_${uuid}.sql`;
  const filepath = path.join('supabase', 'migrations', filename);
  
  const content = `-- ${name}\n-- Criado automaticamente em ${new Date().toISOString()}\n\n${sql}`;
  
  fs.writeFileSync(filepath, content);
  console.log(`✅ Migração criada: ${filename}`);
  return filepath;
}

function runMigration(filepath) {
  try {
    console.log('🚀 Executando migração...');
    execSync('npx supabase migration up', { stdio: 'inherit' });
    console.log('✅ Migração executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    throw error;
  }
}

const migrationTemplates = {
  'add-column': (table, column, type, defaultValue) => `
ALTER TABLE public.${table} 
ADD COLUMN IF NOT EXISTS ${column} ${type}${defaultValue ? ` DEFAULT '${defaultValue}'` : ''};`,
  
  'alter-column-type': (table, column, newType) => `
ALTER TABLE public.${table} 
ALTER COLUMN ${column} TYPE ${newType};`,
  
  'rename-column': (table, oldName, newName) => `
ALTER TABLE public.${table} 
RENAME COLUMN ${oldName} TO ${newName};`,
  
  'drop-column': (table, column) => `
ALTER TABLE public.${table} 
DROP COLUMN IF EXISTS ${column};`,
  
  'add-constraint': (table, constraintName, constraint) => `
ALTER TABLE public.${table} 
ADD CONSTRAINT ${constraintName} ${constraint};`,
  
  'drop-constraint': (table, constraintName) => `
ALTER TABLE public.${table} 
DROP CONSTRAINT IF EXISTS ${constraintName};`,
  
  'create-index': (table, indexName, columns) => `
CREATE INDEX IF NOT EXISTS ${indexName} 
ON public.${table}(${columns});`,
  
  'drop-index': (indexName) => `
DROP INDEX IF EXISTS ${indexName};`,
  
  'update-data': (table, setClause, whereClause) => `
UPDATE public.${table} 
SET ${setClause}${whereClause ? ` WHERE ${whereClause}` : ''};`
};

async function main() {
  console.log('🔧 Assistente de Migração Supabase\n');
  
  console.log('Tipos de migração disponíveis:');
  console.log('1. Adicionar coluna');
  console.log('2. Alterar tipo de coluna');
  console.log('3. Renomear coluna');
  console.log('4. Remover coluna');
  console.log('5. Adicionar constraint');
  console.log('6. Remover constraint');
  console.log('7. Criar índice');
  console.log('8. Remover índice');
  console.log('9. Atualizar dados');
  console.log('10. SQL customizado\n');
  
  const choice = await question('Escolha o tipo de migração (1-10): ');
  const migrationName = await question('Nome da migração: ');
  
  let sql = '';
  
  switch (choice) {
    case '1': {
      const table = await question('Nome da tabela: ');
      const column = await question('Nome da coluna: ');
      const type = await question('Tipo da coluna (ex: text, integer, decimal(10,2)): ');
      const defaultValue = await question('Valor padrão (opcional): ');
      sql = migrationTemplates['add-column'](table, column, type, defaultValue);
      break;
    }
    
    case '2': {
      const table = await question('Nome da tabela: ');
      const column = await question('Nome da coluna: ');
      const newType = await question('Novo tipo: ');
      sql = migrationTemplates['alter-column-type'](table, column, newType);
      break;
    }
    
    case '3': {
      const table = await question('Nome da tabela: ');
      const oldName = await question('Nome atual da coluna: ');
      const newName = await question('Novo nome da coluna: ');
      sql = migrationTemplates['rename-column'](table, oldName, newName);
      break;
    }
    
    case '4': {
      const table = await question('Nome da tabela: ');
      const column = await question('Nome da coluna: ');
      sql = migrationTemplates['drop-column'](table, column);
      break;
    }
    
    case '5': {
      const table = await question('Nome da tabela: ');
      const constraintName = await question('Nome da constraint: ');
      const constraint = await question('Definição da constraint (ex: CHECK (amount > 0)): ');
      sql = migrationTemplates['add-constraint'](table, constraintName, constraint);
      break;
    }
    
    case '6': {
      const table = await question('Nome da tabela: ');
      const constraintName = await question('Nome da constraint: ');
      sql = migrationTemplates['drop-constraint'](table, constraintName);
      break;
    }
    
    case '7': {
      const table = await question('Nome da tabela: ');
      const indexName = await question('Nome do índice: ');
      const columns = await question('Colunas (separadas por vírgula): ');
      sql = migrationTemplates['create-index'](table, indexName, columns);
      break;
    }
    
    case '8': {
      const indexName = await question('Nome do índice: ');
      sql = migrationTemplates['drop-index'](indexName);
      break;
    }
    
    case '9': {
      const table = await question('Nome da tabela: ');
      const setClause = await question('SET clause (ex: status = \'active\'): ');
      const whereClause = await question('WHERE clause (opcional): ');
      sql = migrationTemplates['update-data'](table, setClause, whereClause);
      break;
    }
    
    case '10': {
      sql = await question('Digite o SQL customizado: ');
      break;
    }
    
    default:
      console.log('❌ Opção inválida');
      rl.close();
      return;
  }
  
  console.log('\n📝 SQL gerado:');
  console.log(sql);
  
  const confirm = await question('\nConfirma a criação da migração? (s/n): ');
  
  if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'sim') {
    try {
      const filepath = createMigrationFile(migrationName, sql);
      
      const runNow = await question('Executar migração agora? (s/n): ');
      
      if (runNow.toLowerCase() === 's' || runNow.toLowerCase() === 'sim') {
        runMigration(filepath);
      } else {
        console.log('💡 Para executar depois: npx supabase migration up');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  } else {
    console.log('❌ Migração cancelada');
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMigrationFile, runMigration, migrationTemplates };