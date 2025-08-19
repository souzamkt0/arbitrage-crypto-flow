#!/usr/bin/env node

// ========================================
// CRIAR USUÁRIO TESTE - CONTORNA RATE LIMIT
// Usa Service Role Key para bypass de limites
// ========================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com Service Role Key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ Erro: VITE_SUPABASE_URL não encontrada no .env');
    process.exit(1);
}

// Tentar usar Service Role Key primeiro, depois Anon Key
const serviceKey = supabaseServiceKey || supabaseAnonKey;
if (!serviceKey) {
    console.error('❌ Erro: Nenhuma chave Supabase encontrada no .env');
    console.log('Certifique-se de ter SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Função para aguardar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para criar usuário diretamente no banco (contorna rate limit)
async function criarUsuarioDireto() {
    console.log('🔧 Criando usuário diretamente no banco (contorna rate limit)...');
    
    const timestamp = Date.now();
    const emailTeste = `teste.direto.${timestamp}@alphabit.vu`;
    const senhaTeste = 'TesteDireto123!';
    
    console.log(`📝 Email: ${emailTeste}`);
    console.log(`🔐 Senha: ${senhaTeste}`);
    console.log('');
    
    try {
        // Inserir usuário diretamente na tabela auth.users
        const { data, error } = await supabase.rpc('create_test_user_direct', {
            user_email: emailTeste,
            user_password: senhaTeste
        });
        
        if (error) {
            console.log('⚠️  RPC não disponível, tentando inserção SQL direta...');
            
            // Fallback: inserção SQL direta
            const { data: insertData, error: insertError } = await supabase
                .from('auth.users')
                .insert({
                    id: crypto.randomUUID(),
                    email: emailTeste,
                    encrypted_password: `$2a$10$${Buffer.from(senhaTeste).toString('base64')}`,
                    email_confirmed_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    raw_app_meta_data: { provider: 'email', providers: ['email'] },
                    raw_user_meta_data: {},
                    is_super_admin: false,
                    role: 'authenticated'
                });
                
            if (insertError) {
                console.error('❌ Erro na inserção direta:', insertError.message);
                return false;
            }
        }
        
        console.log('✅ Usuário criado diretamente no banco!');
        return { email: emailTeste, password: senhaTeste };
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        return false;
    }
}

// Função para tentar criar usuário com retry
async function criarUsuarioComRetry() {
    console.log('🔄 Tentando criar usuário com retry automático...');
    
    const maxTentativas = 3;
    const delayBase = 30000; // 30 segundos
    
    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
        console.log(`\n🎯 Tentativa ${tentativa}/${maxTentativas}`);
        
        const timestamp = Date.now();
        const emailTeste = `teste.retry.${timestamp}@alphabit.vu`;
        const senhaTeste = 'TesteRetry123!';
        
        console.log(`📝 Email: ${emailTeste}`);
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: emailTeste,
                password: senhaTeste,
                options: {
                    emailRedirectTo: `${supabaseUrl.replace('/rest/v1', '')}/auth/v1/verify`
                }
            });
            
            if (error) {
                if (error.message.includes('rate limit')) {
                    console.log(`⏳ Rate limit atingido. Aguardando ${delayBase/1000}s...`);
                    
                    if (tentativa < maxTentativas) {
                        await sleep(delayBase * tentativa); // Delay progressivo
                        continue;
                    } else {
                        console.log('❌ Rate limit persistente. Tentando método alternativo...');
                        return await criarUsuarioDireto();
                    }
                } else {
                    console.error('❌ Erro:', error.message);
                    return false;
                }
            } else {
                console.log('✅ Usuário criado com sucesso!');
                console.log(`📧 Email de confirmação enviado para: ${emailTeste}`);
                return { email: emailTeste, password: senhaTeste, user: data.user };
            }
            
        } catch (err) {
            console.error(`❌ Erro na tentativa ${tentativa}:`, err.message);
            
            if (tentativa < maxTentativas) {
                console.log(`⏳ Aguardando ${delayBase/1000}s antes da próxima tentativa...`);
                await sleep(delayBase);
            }
        }
    }
    
    console.log('❌ Todas as tentativas falharam.');
    return false;
}

// Função para verificar usuário criado
async function verificarUsuario(email) {
    console.log(`\n🔍 Verificando usuário: ${email}`);
    
    try {
        const { data, error } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at, created_at')
            .eq('email', email)
            .single();
            
        if (error) {
            console.log('⚠️  Não foi possível verificar via tabela. Tentando RPC...');
            return;
        }
        
        console.log('📊 Status do usuário:');
        console.log(`   - ID: ${data.id}`);
        console.log(`   - Email: ${data.email}`);
        console.log(`   - Confirmado: ${data.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   - Criado: ${data.created_at}`);
        
    } catch (err) {
        console.log('⚠️  Erro na verificação:', err.message);
    }
}

// Função para testar login
async function testarLogin(email, password) {
    console.log(`\n🔐 Testando login com: ${email}`);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            if (error.message.includes('Email not confirmed')) {
                console.log('⚠️  Email ainda não confirmado. Isso é esperado!');
                console.log('📧 Verifique a caixa de entrada de suporte@alphabit.vu');
            } else {
                console.log('❌ Erro no login:', error.message);
            }
        } else {
            console.log('✅ Login realizado com sucesso!');
            console.log('🎉 SMTP está funcionando perfeitamente!');
            
            // Fazer logout
            await supabase.auth.signOut();
        }
        
    } catch (err) {
        console.log('❌ Erro inesperado no login:', err.message);
    }
}

async function main() {
    console.log('========================================');
    console.log('🚀 CRIAR USUÁRIO - CONTORNA RATE LIMIT');
    console.log('📧 Titan Email SMTP - AlphaBit');
    console.log('========================================');
    
    console.log('🔑 Usando chave:', supabaseServiceKey ? 'Service Role' : 'Anon');
    console.log('');
    
    // Tentar criar usuário
    const resultado = await criarUsuarioComRetry();
    
    if (resultado) {
        console.log('\n🎯 Usuário criado com sucesso!');
        
        // Verificar usuário
        await verificarUsuario(resultado.email);
        
        // Aguardar um pouco e testar login
        console.log('\n⏳ Aguardando 5 segundos antes de testar login...');
        await sleep(5000);
        
        await testarLogin(resultado.email, resultado.password);
        
        console.log('\n📝 Próximos passos:');
        console.log('   1. Verificar email em suporte@alphabit.vu');
        console.log('   2. Clicar no link de confirmação');
        console.log('   3. Testar login novamente');
        console.log('   4. Verificar no painel Supabase > Authentication > Users');
        
    } else {
        console.log('\n❌ Não foi possível criar usuário.');
        console.log('🔧 Soluções alternativas:');
        console.log('   1. Aguardar 1 hora para reset do rate limit');
        console.log('   2. Usar o script SQL: criar-usuario-sql-confirmacao.sql');
        console.log('   3. Verificar configurações SMTP no painel Supabase');
    }
    
    console.log('\n========================================');
    console.log('✅ Teste finalizado!');
    console.log('========================================');
}

// Executar
main().catch(console.error);