#!/usr/bin/env node

// ========================================
// CRIAR USUÁRIO TESTE COM CONFIRMAÇÃO DE EMAIL
// Testa o SMTP Titan Email configurado
// ========================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function criarUsuarioTeste() {
    console.log('🚀 Iniciando teste de criação de usuário com confirmação de email...');
    console.log('📧 SMTP Titan Email configurado: smtp.titan.email:587');
    console.log('📤 Sender: noreply@alphabit.vu');
    console.log('');

    // Gerar email único para teste
    const timestamp = Date.now();
    const emailTeste = `teste.confirmacao.${timestamp}@alphabit.vu`;
    const senhaTeste = 'TesteConfirmacao123!';

    console.log(`📝 Criando usuário teste: ${emailTeste}`);
    console.log(`🔐 Senha: ${senhaTeste}`);
    console.log('');

    try {
        // Tentar criar usuário
        const { data, error } = await supabase.auth.signUp({
            email: emailTeste,
            password: senhaTeste,
            options: {
                emailRedirectTo: `${supabaseUrl.replace('/rest/v1', '')}/auth/v1/verify`
            }
        });

        if (error) {
            console.error('❌ Erro ao criar usuário:', error.message);
            
            // Verificar tipos específicos de erro
            if (error.message.includes('Email rate limit exceeded')) {
                console.log('⚠️  Rate limit atingido. Aguarde alguns minutos antes de tentar novamente.');
            } else if (error.message.includes('Invalid email')) {
                console.log('⚠️  Email inválido. Verifique o formato.');
            } else if (error.message.includes('Password')) {
                console.log('⚠️  Problema com a senha. Verifique os requisitos.');
            } else if (error.message.includes('SMTP')) {
                console.log('⚠️  Problema com configuração SMTP.');
                console.log('🔧 Verifique as configurações no painel Supabase:');
                console.log('   - Authentication > Settings > SMTP Settings');
                console.log('   - Host: smtp.titan.email');
                console.log('   - Port: 587');
                console.log('   - User: suporte@alphabit.vu');
                console.log('   - Sender: noreply@alphabit.vu');
            }
            return;
        }

        console.log('✅ Usuário criado com sucesso!');
        console.log('📊 Dados do usuário:');
        console.log(`   - ID: ${data.user?.id}`);
        console.log(`   - Email: ${data.user?.email}`);
        console.log(`   - Confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   - Criado em: ${data.user?.created_at}`);
        console.log('');

        if (data.user && !data.user.email_confirmed_at) {
            console.log('📧 Email de confirmação enviado!');
            console.log('🔍 Verifique:');
            console.log('   1. Caixa de entrada de suporte@alphabit.vu');
            console.log('   2. Pasta de spam/lixo eletrônico');
            console.log('   3. Logs do Titan Email');
            console.log('');
            
            console.log('⏱️  Aguardando confirmação...');
            console.log('💡 Para confirmar manualmente, execute no SQL Editor:');
            console.log(`   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${emailTeste}';`);
        } else {
            console.log('⚠️  Usuário já confirmado automaticamente.');
        }

        console.log('');
        console.log('🔍 Para verificar o status, execute no SQL Editor:');
        console.log(`SELECT id, email, email_confirmed_at, created_at FROM auth.users WHERE email = '${emailTeste}';`);
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        console.log('🔧 Verifique:');
        console.log('   1. Conexão com internet');
        console.log('   2. Configurações do Supabase');
        console.log('   3. Variáveis de ambiente');
    }
}

async function verificarStatusSMTP() {
    console.log('🔍 Verificando status do SMTP...');
    
    try {
        // Tentar fazer uma operação simples para testar conectividade
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log('⚠️  Problema de conectividade:', error.message);
        } else {
            console.log('✅ Conexão com Supabase OK');
        }
        
    } catch (err) {
        console.log('❌ Erro de conectividade:', err.message);
    }
    
    console.log('');
}

async function main() {
    console.log('========================================');
    console.log('🧪 TESTE DE USUÁRIO COM CONFIRMAÇÃO EMAIL');
    console.log('📧 Titan Email SMTP - AlphaBit');
    console.log('========================================');
    console.log('');
    
    await verificarStatusSMTP();
    await criarUsuarioTeste();
    
    console.log('');
    console.log('========================================');
    console.log('✅ Teste finalizado!');
    console.log('📝 Próximos passos:');
    console.log('   1. Verificar email de confirmação');
    console.log('   2. Clicar no link de confirmação');
    console.log('   3. Verificar status no SQL Editor');
    console.log('   4. Testar login com o usuário criado');
    console.log('========================================');
}

// Executar o teste
main().catch(console.error);