const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelaProfiles() {
    console.log('🔍 Verificando estado da tabela profiles...');
    
    try {
        // Tentar acessar a tabela profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Erro ao acessar tabela profiles:', error.message);
            console.log('\n🚨 PROBLEMA IDENTIFICADO: Tabela profiles com problemas!');
            return false;
        }
        
        console.log('✅ Tabela profiles acessível');
        console.log('Registros encontrados:', data?.length || 0);
        
        return true;
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        return false;
    }
}

async function verificarUsuarios() {
    console.log('\n👥 Verificando usuários existentes...');
    
    try {
        // Verificar se há usuários no auth
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            console.log('⚠️ Não foi possível listar usuários (permissão limitada)');
            return;
        }
        
        console.log(`📊 Total de usuários: ${users?.length || 0}`);
        
    } catch (err) {
        console.log('⚠️ Verificação de usuários limitada pela API');
    }
}

async function main() {
    console.log('🚀 Diagnóstico completo do sistema\n');
    
    const tabelaOK = await verificarTabelaProfiles();
    await verificarUsuarios();
    
    console.log('\n' + '='.repeat(60));
    
    if (!tabelaOK) {
        console.log('🔧 SOLUÇÃO OBRIGATÓRIA:');
        console.log('\n1. Abra o Supabase Dashboard');
        console.log('2. Vá para SQL Editor');
        console.log('3. Copie e execute TODO o conteúdo do arquivo:');
        console.log('   📄 recreate-profiles-complete.sql');
        console.log('4. Aguarde a execução completa (sem erros)');
        console.log('5. Execute novamente: node test-registration.cjs');
        
        console.log('\n⚠️ IMPORTANTE:');
        console.log('- Execute TODO o script de uma vez');
        console.log('- Não execute linha por linha');
        console.log('- Aguarde a mensagem de sucesso');
        
    } else {
        console.log('✅ Tabela profiles parece estar OK');
        console.log('🔄 Teste o cadastro: node test-registration.cjs');
    }
    
    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);