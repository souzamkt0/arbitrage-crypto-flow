import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configurações do Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyInvestmentPlansUpdate() {
  try {
    console.log('🚀 Iniciando atualização dos planos de investimento...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'update-investment-plans.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    // Dividir o SQL em comandos individuais (separados por ;)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('SELECT \'✅'));
    
    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar`);
    
    // Executar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.toLowerCase().includes('comment on') || 
          command.toLowerCase().includes('create or replace view') ||
          command.toLowerCase().includes('create or replace function') ||
          command.toLowerCase().includes('create trigger') ||
          command.toLowerCase().includes('drop trigger')) {
        console.log(`⏭️  Pulando comando ${i + 1} (não suportado via API): ${command.substring(0, 50)}...`);
        continue;
      }
      
      try {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        // Para comandos ALTER TABLE, INSERT, UPDATE
        if (command.toLowerCase().includes('alter table') ||
            command.toLowerCase().includes('insert into') ||
            command.toLowerCase().includes('update ')) {
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: command + ';'
          });
          
          if (error) {
            console.warn(`⚠️  Aviso no comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        }
        
      } catch (cmdError) {
        console.warn(`⚠️  Erro no comando ${i + 1}:`, cmdError.message);
      }
    }
    
    console.log('\n🔍 Verificando os planos atualizados...');
    
    // Verificar se as alterações foram aplicadas
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .order('name');
    
    if (plansError) {
      console.error('❌ Erro ao verificar planos:', plansError);
      return;
    }
    
    if (plans && plans.length > 0) {
      console.log('\n📊 Planos de investimento atualizados:');
      console.table(plans.map(plan => ({
        Nome: plan.name,
        'Taxa Diária': plan.daily_rate ? `${plan.daily_rate}%` : 'N/A',
        'Mín. USDT': plan.minimum_amount ? `$${plan.minimum_amount}` : 'N/A',
        'Máx. USDT': plan.maximum_amount ? `$${plan.maximum_amount}` : 'N/A',
        'Indicações': plan.required_referrals || 0,
        'Taxa Contrato': plan.contract_fee ? `$${plan.contract_fee}` : '$0',
        Status: plan.status
      })));
    } else {
      console.log('⚠️  Nenhum plano encontrado na tabela');
    }
    
    // Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'investment_plans' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (!tableError && tableInfo) {
      console.log('📋 Estrutura da tabela investment_plans:');
      console.table(tableInfo);
    }
    
    console.log('\n✅ Atualização dos planos de investimento concluída!');
    console.log('\n📝 Resumo das alterações:');
    console.log('• Robô 4.0.0: 0 indicações, 2.5% diário, $10 USDT mínimo');
    console.log('• Robô 4.0.5: 10 indicações, 3.0% diário, $20 USDT mínimo + $10 taxa');
    console.log('• Robô 4.1.0: 20 indicações, 4.0% diário, $500 USDT mínimo + $10 taxa');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar conexão
async function testConnection() {
  try {
    console.log('🔗 Testando conexão com Supabase...');
    const { data, error } = await supabase
      .from('investment_plans')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
}

// Executar o script
async function main() {
  console.log('🎯 Script de Atualização dos Planos de Investimento');
  console.log('=' .repeat(50));
  
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Não foi possível conectar ao Supabase. Verifique as credenciais.');
    return;
  }
  
  await applyInvestmentPlansUpdate();
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { applyInvestmentPlansUpdate, testConnection };