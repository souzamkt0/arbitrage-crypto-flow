#!/usr/bin/env node

/**
 * CONFIRMAÇÃO MANUAL DE EMAIL
 * Para quando o email de confirmação não chega
 * Email: newani7815@gardsiir.com
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const TEST_EMAIL = 'newani7815@gardsiir.com';
const TEST_PASSWORD = 'TesteSQLDireto123!';

async function confirmarEmailManual() {
    console.log('🔧 CONFIRMAÇÃO MANUAL DE EMAIL');
    console.log('========================================');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log('');

    try {
        // Inicializar cliente Supabase com Service Role Key
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceRoleKey) {
            console.log('❌ Variáveis de ambiente necessárias:');
            console.log('   - VITE_SUPABASE_URL');
            console.log('   - SUPABASE_SERVICE_ROLE_KEY');
            console.log('');
            console.log('💡 Alternativa: Use o SQL Editor do Supabase');
            console.log('📁 Arquivo: criar-usuario-teste-newani.sql');
            return;
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        
        console.log('🔗 Conectado ao Supabase com Service Role');
        console.log('🔍 Verificando usuário...');
        
        // Verificar se o usuário existe
        const { data: users, error: fetchError } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at, created_at')
            .eq('email', TEST_EMAIL);
            
        if (fetchError) {
            console.log('❌ Erro ao buscar usuário:', fetchError.message);
            console.log('');
            console.log('💡 SOLUÇÃO ALTERNATIVA - SQL DIRETO:');
            console.log('   1. Abra o Supabase SQL Editor');
            console.log('   2. Execute o comando:');
            console.log(`   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${TEST_EMAIL}';`);
            return;
        }
        
        if (!users || users.length === 0) {
            console.log('❌ Usuário não encontrado!');
            console.log('🔄 Criando usuário novamente...');
            
            // Tentar criar o usuário novamente
            const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
            const anonSupabase = createClient(supabaseUrl, anonKey);
            
            const { data, error } = await anonSupabase.auth.signUp({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            
            if (error) {
                console.log('❌ Erro na criação:', error.message);
            } else {
                console.log('✅ Usuário recriado!');
                console.log(`   - ID: ${data.user?.id}`);
            }
            return;
        }
        
        const user = users[0];
        console.log('✅ Usuário encontrado!');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Criado em: ${user.created_at}`);
        console.log(`   - Confirmado: ${user.email_confirmed_at ? '✅ Sim' : '❌ Não'}`);
        console.log('');
        
        if (user.email_confirmed_at) {
            console.log('✅ EMAIL JÁ CONFIRMADO!');
            console.log('🎯 Pode fazer login na aplicação');
        } else {
            console.log('🔧 Confirmando email manualmente...');
            
            // Confirmar email manualmente
            const { error: updateError } = await supabase
                .from('auth.users')
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq('email', TEST_EMAIL);
                
            if (updateError) {
                console.log('❌ Erro na confirmação:', updateError.message);
                console.log('');
                console.log('💡 EXECUTE NO SQL EDITOR:');
                console.log(`   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${TEST_EMAIL}';`);
            } else {
                console.log('✅ EMAIL CONFIRMADO MANUALMENTE!');
                console.log('🎯 Agora pode fazer login na aplicação');
            }
        }
        
        console.log('');
        console.log('🔐 CREDENCIAIS PARA LOGIN:');
        console.log(`   - Email: ${TEST_EMAIL}`);
        console.log(`   - Senha: ${TEST_PASSWORD}`);
        
    } catch (error) {
        console.log('❌ ERRO GERAL:', error.message);
        console.log('');
        console.log('💡 SOLUÇÃO MANUAL - SQL EDITOR:');
        console.log('   1. Abra o Supabase SQL Editor');
        console.log('   2. Execute:');
        console.log(`   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${TEST_EMAIL}';`);
        console.log('   3. Verifique:');
        console.log(`   SELECT email, email_confirmed_at FROM auth.users WHERE email = '${TEST_EMAIL}';`);
    }
    
    console.log('');
    console.log('========================================');
    console.log('🎯 CONFIRMAÇÃO FINALIZADA');
}

async function verificarStatusSMTP() {
    console.log('');
    console.log('📧 VERIFICANDO STATUS SMTP');
    console.log('========================================');
    
    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !anonKey) {
            console.log('❌ Variáveis de ambiente não encontradas');
            return;
        }
        
        const supabase = createClient(supabaseUrl, anonKey);
        
        console.log('🔍 Testando reenvio de email...');
        
        // Tentar reenviar email de confirmação
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: TEST_EMAIL
        });
        
        if (error) {
            if (error.message.includes('rate limit')) {
                console.log('⚠️  RATE LIMIT ATIVO!');
                console.log('💡 Use confirmação manual');
            } else if (error.message.includes('already confirmed')) {
                console.log('✅ Email já confirmado!');
            } else {
                console.log('❌ Erro SMTP:', error.message);
                console.log('');
                console.log('🔧 POSSÍVEIS CAUSAS:');
                console.log('   - SMTP não configurado no Supabase');
                console.log('   - Credenciais Titan Email incorretas');
                console.log('   - Rate limit ativo');
            }
        } else {
            console.log('✅ Email reenviado com sucesso!');
            console.log('📧 Verifique a caixa de entrada');
        }
        
    } catch (error) {
        console.log('❌ Erro na verificação SMTP:', error.message);
    }
    
    console.log('');
    console.log('🔧 CONFIGURAÇÃO SMTP ESPERADA:');
    console.log('   - Host: smtp.titan.email');
    console.log('   - Port: 587');
    console.log('   - User: suporte@alphabit.vu');
    console.log('   - From: noreply@alphabit.vu');
    console.log('   - Encryption: STARTTLS');
}

// Executar ambas as funções
if (require.main === module) {
    (async () => {
        await confirmarEmailManual();
        await verificarStatusSMTP();
    })();
}

module.exports = { confirmarEmailManual, verificarStatusSMTP };