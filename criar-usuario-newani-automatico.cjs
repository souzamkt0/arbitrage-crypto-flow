#!/usr/bin/env node

/**
 * CRIAÇÃO AUTOMÁTICA DE USUÁRIO TESTE
 * Email: newani7815@gardsiir.com
 * Executa diretamente no Supabase sem editar SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do usuário teste
const TEST_USER = {
    email: 'newani7815@gardsiir.com',
    password: 'TesteSQLDireto123!',
    options: {
        emailRedirectTo: undefined // Usar configuração padrão do Supabase
    }
};

async function criarUsuarioTeste() {
    console.log('🚀 INICIANDO CRIAÇÃO DE USUÁRIO TESTE');
    console.log('========================================');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔐 Senha: ${TEST_USER.password}`);
    console.log('');

    try {
        // Inicializar cliente Supabase
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('❌ Variáveis de ambiente do Supabase não encontradas!');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('🔗 Conectado ao Supabase');
        console.log('📝 Criando usuário...');
        
        // Tentar criar o usuário
        const { data, error } = await supabase.auth.signUp({
            email: TEST_USER.email,
            password: TEST_USER.password,
            options: TEST_USER.options
        });

        if (error) {
            if (error.message.includes('User already registered')) {
                console.log('⚠️  USUÁRIO JÁ EXISTE!');
                console.log('🔄 Tentando reenviar email de confirmação...');
                
                // Tentar reenviar email de confirmação
                const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email: TEST_USER.email
                });
                
                if (resendError) {
                    console.log('❌ Erro ao reenviar email:', resendError.message);
                } else {
                    console.log('✅ Email de confirmação reenviado!');
                }
            } else if (error.message.includes('rate limit')) {
                console.log('⚠️  RATE LIMIT DETECTADO!');
                console.log('💡 Solução: Use o script SQL direto no Supabase Editor');
                console.log('📁 Arquivo: criar-usuario-teste-newani.sql');
            } else {
                console.log('❌ Erro na criação:', error.message);
            }
        } else {
            console.log('✅ USUÁRIO CRIADO COM SUCESSO!');
            console.log('');
            console.log('📊 DADOS DO USUÁRIO:');
            console.log(`   - ID: ${data.user?.id}`);
            console.log(`   - Email: ${data.user?.email}`);
            console.log(`   - Confirmado: ${data.user?.email_confirmed_at ? '✅ Sim' : '❌ Não'}`);
            console.log('');
            
            if (!data.user?.email_confirmed_at) {
                console.log('📧 EMAIL DE CONFIRMAÇÃO ENVIADO!');
                console.log('📝 Próximos passos:');
                console.log('   1. Verificar email em newani7815@gardsiir.com');
                console.log('   2. Clicar no link de confirmação');
                console.log('   3. Testar login na aplicação');
            }
        }
        
        console.log('');
        console.log('🔧 CONFIGURAÇÃO SMTP ATIVA:');
        console.log('   - Servidor: smtp.titan.email:587');
        console.log('   - Usuário: suporte@alphabit.vu');
        console.log('   - Remetente: noreply@alphabit.vu');
        console.log('   - Encriptação: STARTTLS');
        
    } catch (error) {
        console.log('❌ ERRO GERAL:', error.message);
        console.log('');
        console.log('💡 ALTERNATIVAS:');
        console.log('   1. Verificar variáveis de ambiente (.env)');
        console.log('   2. Usar script SQL: criar-usuario-teste-newani.sql');
        console.log('   3. Verificar configuração SMTP no Supabase');
    }
    
    console.log('');
    console.log('========================================');
    console.log('🎯 SCRIPT FINALIZADO');
}

// Executar se chamado diretamente
if (require.main === module) {
    criarUsuarioTeste();
}

module.exports = { criarUsuarioTeste, TEST_USER };