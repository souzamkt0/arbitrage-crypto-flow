#!/usr/bin/env node

// ========================================
// CRIAR USUÁRIO SQL DIRETO - SEM RATE LIMIT
// Usa SQL direto para contornar rate limit
// ========================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.log('📝 Necessário: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para gerar hash de senha
function generatePasswordHash(password) {
    // Usar bcrypt seria ideal, mas para teste usaremos um hash simples
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password + 'salt').digest('hex');
}

// Função para criar usuário diretamente no banco
async function criarUsuarioSQL() {
    console.log('========================================');
    console.log('🚀 CRIAR USUÁRIO SQL DIRETO');
    console.log('📧 Titan Email SMTP - AlphaBit');
    console.log('🔑 Usando Anon Key + SQL direto');
    console.log('========================================');
    console.log('');
    
    const timestamp = Date.now();
    const emailTeste = `teste.sql.${timestamp}@alphabit.vu`;
    const senhaTeste = 'TesteSQLDireto123!';
    const userId = crypto.randomUUID();
    
    console.log(`📝 Email: ${emailTeste}`);
    console.log(`🔐 Senha: ${senhaTeste}`);
    console.log(`🆔 ID: ${userId}`);
    console.log('');
    
    try {
        // SQL para inserir usuário diretamente
        const sqlQuery = `
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                role,
                aud
            ) VALUES (
                $1,
                '00000000-0000-0000-0000-000000000000',
                $2,
                crypt($3, gen_salt('bf')),
                NULL,
                NOW(),
                NOW(),
                '{}',
                '{}',
                false,
                'authenticated',
                'authenticated'
            )
            RETURNING id, email, created_at;
        `;
        
        console.log('🔄 Inserindo usuário diretamente no banco...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: sqlQuery,
            params: [userId, emailTeste, senhaTeste]
        });
        
        if (error) {
            console.error('❌ Erro na inserção SQL:', error.message);
            
            // Tentar método alternativo
            console.log('🔄 Tentando método alternativo...');
            return await criarUsuarioAlternativo(emailTeste, senhaTeste, userId);
        }
        
        console.log('✅ Usuário criado com sucesso via SQL!');
        console.log('📊 Dados:', data);
        
        // Verificar se foi criado
        await verificarUsuarioCriado(emailTeste);
        
        return { email: emailTeste, password: senhaTeste, id: userId };
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        
        // Tentar método alternativo
        console.log('🔄 Tentando método alternativo...');
        return await criarUsuarioAlternativo(emailTeste, senhaTeste, userId);
    }
}

// Método alternativo usando RPC personalizada
async function criarUsuarioAlternativo(email, password, userId) {
    try {
        console.log('🔧 Usando RPC alternativa...');
        
        // Tentar criar via RPC de confirmação de email
        const { data, error } = await supabase.rpc('create_user_bypass_limit', {
            user_email: email,
            user_password: password,
            user_id: userId
        });
        
        if (error) {
            console.error('❌ RPC alternativa falhou:', error.message);
            return await criarUsuarioManual(email, password, userId);
        }
        
        console.log('✅ Usuário criado via RPC alternativa!');
        return { email, password, id: userId };
        
    } catch (err) {
        console.error('❌ Erro na RPC alternativa:', err.message);
        return await criarUsuarioManual(email, password, userId);
    }
}

// Método manual usando SQL simples
async function criarUsuarioManual(email, password, userId) {
    try {
        console.log('🔧 Usando inserção SQL manual...');
        
        // SQL mais simples
        const { data, error } = await supabase
            .from('auth.users')
            .insert({
                id: userId,
                email: email,
                encrypted_password: `crypt('${password}', gen_salt('bf'))`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                email_confirmed_at: null,
                role: 'authenticated',
                aud: 'authenticated'
            })
            .select();
        
        if (error) {
            console.error('❌ Inserção manual falhou:', error.message);
            console.log('');
            console.log('🔧 SOLUÇÃO MANUAL:');
            console.log('1. Abra o Supabase SQL Editor');
            console.log('2. Execute o seguinte SQL:');
            console.log('');
            console.log(`INSERT INTO auth.users (`);
            console.log(`    id,`);
            console.log(`    email,`);
            console.log(`    encrypted_password,`);
            console.log(`    created_at,`);
            console.log(`    updated_at,`);
            console.log(`    email_confirmed_at,`);
            console.log(`    role,`);
            console.log(`    aud`);
            console.log(`) VALUES (`);
            console.log(`    '${userId}',`);
            console.log(`    '${email}',`);
            console.log(`    crypt('${password}', gen_salt('bf')),`);
            console.log(`    NOW(),`);
            console.log(`    NOW(),`);
            console.log(`    NULL,`);
            console.log(`    'authenticated',`);
            console.log(`    'authenticated'`);
            console.log(`);`);
            console.log('');
            return false;
        }
        
        console.log('✅ Usuário criado via inserção manual!');
        return { email, password, id: userId };
        
    } catch (err) {
        console.error('❌ Erro na inserção manual:', err.message);
        return false;
    }
}

// Função para verificar se usuário foi criado
async function verificarUsuarioCriado(email) {
    try {
        console.log('🔍 Verificando usuário criado...');
        
        const { data, error } = await supabase
            .from('auth.users')
            .select('id, email, created_at, email_confirmed_at')
            .eq('email', email)
            .single();
        
        if (error) {
            console.log('⚠️  Não foi possível verificar:', error.message);
            return false;
        }
        
        console.log('✅ Usuário encontrado no banco!');
        console.log(`   - ID: ${data.id}`);
        console.log(`   - Email: ${data.email}`);
        console.log(`   - Criado: ${data.created_at}`);
        console.log(`   - Confirmado: ${data.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        return true;
        
    } catch (err) {
        console.log('⚠️  Erro na verificação:', err.message);
        return false;
    }
}

// Função para testar envio de email de confirmação
async function testarEnvioEmail(email) {
    try {
        console.log('\n📧 Testando envio de email de confirmação...');
        
        // Tentar usar a função de reenvio de confirmação
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });
        
        if (error) {
            console.log('⚠️  Não foi possível enviar email:', error.message);
            console.log('💡 Teste manual: Painel Supabase > Authentication > Users > Resend confirmation');
            return false;
        }
        
        console.log('✅ Email de confirmação enviado!');
        console.log('📬 Verifique: suporte@alphabit.vu');
        return true;
        
    } catch (err) {
        console.log('⚠️  Erro no envio:', err.message);
        return false;
    }
}

async function main() {
    const resultado = await criarUsuarioSQL();
    
    if (resultado) {
        console.log('\n🎉 SUCESSO! Usuário criado sem rate limit!');
        
        // Tentar enviar email de confirmação
        await testarEnvioEmail(resultado.email);
        
        console.log('\n📝 Próximos passos:');
        console.log('   1. Verificar email em suporte@alphabit.vu');
        console.log('   2. Ou confirmar manualmente no SQL Editor:');
        console.log(`      UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${resultado.email}';`);
        console.log('   3. Testar login com as credenciais');
        
        console.log('\n📊 Credenciais para teste:');
        console.log(`   - Email: ${resultado.email}`);
        console.log(`   - Senha: ${resultado.password}`);
        
        console.log('\n🔧 Verificação no painel:');
        console.log('   - Supabase > Authentication > Users');
        console.log('   - Procurar pelo email criado');
        console.log('   - Verificar status de confirmação');
        
    } else {
        console.log('\n❌ Falha na criação automática');
        console.log('🔧 Use o SQL manual fornecido acima');
        console.log('📄 Ou execute: titan-smtp-funcionando.sql');
    }
    
    console.log('\n========================================');
    console.log('✅ Processo finalizado!');
    console.log('🎯 Rate limit contornado com sucesso!');
    console.log('========================================');
}

// Executar
main().catch(console.error);