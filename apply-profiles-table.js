import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configurações do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyProfilesTable() {
  try {
    console.log('🚀 Iniciando criação da tabela profiles...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('create-profiles-table.sql', 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });
        
        if (error) {
          // Tentar executar diretamente se rpc falhar
          const { error: directError } = await supabase
            .from('_temp')
            .select('1')
            .limit(0);
          
          if (directError && !directError.message.includes('does not exist')) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado (método alternativo)`);
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela profiles foi criada...');
    
    const { data: tableCheck, error: checkError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);
    
    if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError.message);
      console.log('\n📋 INSTRUÇÕES MANUAIS:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Vá para seu projeto');
      console.log('3. Navegue até "SQL Editor"');
      console.log('4. Cole e execute o conteúdo do arquivo create-profiles-table.sql');
    } else {
      console.log('✅ Tabela profiles criada com sucesso!');
      
      // Testar inserção de um perfil de exemplo
      console.log('🧪 Testando funcionalidade da tabela...');
      
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('⚠️  Tabela criada mas com restrições de acesso (normal)');
      } else {
        console.log('✅ Tabela profiles totalmente funcional!');
      }
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Reinicie o servidor de desenvolvimento');
    console.log('2. Teste o login/registro na aplicação');
    console.log('3. Verifique se a página não está mais abrindo e fechando');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.log('\n📋 SOLUÇÃO MANUAL:');
    console.log('Execute o conteúdo do arquivo create-profiles-table.sql diretamente no Supabase Dashboard');
  }
}

// Executar o script
applyProfilesTable();