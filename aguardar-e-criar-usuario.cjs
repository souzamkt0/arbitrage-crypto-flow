#!/usr/bin/env node

// ========================================
// AGUARDAR RATE LIMIT E CRIAR USUÁRIO
// Aguarda tempo suficiente para reset do limite
// ========================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para aguardar com contador
function sleepWithCounter(ms, message = 'Aguardando') {
    return new Promise(resolve => {
        const seconds = Math.floor(ms / 1000);
        let remaining = seconds;
        
        console.log(`⏳ ${message}: ${remaining}s`);
        
        const interval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                process.stdout.write(`\r⏳ ${message}: ${remaining}s`);
            } else {
                process.stdout.write(`\r✅ ${message}: Concluído!\n`);
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

// Função para verificar se ainda há rate limit
async function verificarRateLimit() {
    console.log('🔍 Verificando status do rate limit...');
    
    const emailTeste = `verificacao.${Date.now()}@alphabit.vu`;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: emailTeste,
            password: 'VerificacaoTeste123!'
        });
        
        if (error) {
            if (error.message.includes('rate limit')) {
                console.log('❌ Rate limit ainda ativo');
                return true; // Ainda há rate limit
            } else {
                console.log('✅ Rate limit liberado (outro erro encontrado)');
                console.log('⚠️  Erro:', error.message);
                return false; // Rate limit ok, mas outro problema
            }
        } else {
            console.log('✅ Rate limit liberado! Usuário de verificação criado.');
            return false; // Sem rate limit
        }
        
    } catch (err) {
        console.log('⚠️  Erro na verificação:', err.message);
        return true; // Assumir que ainda há rate limit
    }
}

// Função para criar usuário final
async function criarUsuarioFinal() {
    console.log('\n🎯 Criando usuário final para teste de SMTP...');
    
    const timestamp = Date.now();
    const emailTeste = `teste.smtp.final.${timestamp}@alphabit.vu`;
    const senhaTeste = 'TesteSMTPFinal123!';
    
    console.log(`📝 Email: ${emailTeste}`);
    console.log(`🔐 Senha: ${senhaTeste}`);
    console.log('');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: emailTeste,
            password: senhaTeste,
            options: {
                emailRedirectTo: `${supabaseUrl.replace('/rest/v1', '')}/auth/v1/verify`
            }
        });
        
        if (error) {
            console.error('❌ Erro ao criar usuário final:', error.message);
            return false;
        }
        
        console.log('✅ Usuário final criado com sucesso!');
        console.log('📊 Dados do usuário:');
        console.log(`   - ID: ${data.user?.id}`);
        console.log(`   - Email: ${data.user?.email}`);
        console.log(`   - Confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log('');
        
        if (!data.user?.email_confirmed_at) {
            console.log('📧 Email de confirmação enviado!');
            console.log('🔍 Verifique:');
            console.log('   1. Caixa de entrada: suporte@alphabit.vu');
            console.log('   2. Pasta de spam/lixo eletrônico');
            console.log('   3. Painel Supabase > Authentication > Users');
            console.log('');
            console.log('🎉 SMTP Titan Email está funcionando!');
        }
        
        return { email: emailTeste, password: senhaTeste, user: data.user };
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        return false;
    }
}

// Função para aguardar reset completo do rate limit
async function aguardarResetCompleto() {
    console.log('⏰ Aguardando reset completo do rate limit...');
    console.log('📝 O Supabase geralmente reseta rate limits a cada hora');
    console.log('');
    
    // Aguardar 5 minutos (tempo conservador)
    await sleepWithCounter(300000, 'Aguardando reset do rate limit');
    
    console.log('\n🔄 Verificando se o rate limit foi resetado...');
    
    let tentativas = 0;
    const maxTentativas = 3;
    
    while (tentativas < maxTentativas) {
        const temRateLimit = await verificarRateLimit();
        
        if (!temRateLimit) {
            console.log('✅ Rate limit resetado com sucesso!');
            return true;
        }
        
        tentativas++;
        console.log(`\n⏳ Tentativa ${tentativas}/${maxTentativas} - Rate limit ainda ativo`);
        
        if (tentativas < maxTentativas) {
            console.log('⏰ Aguardando mais 2 minutos...');
            await sleepWithCounter(120000, 'Aguardando adicional');
        }
    }
    
    console.log('\n⚠️  Rate limit ainda ativo após várias tentativas');
    console.log('💡 Recomendação: Use o script SQL para criar usuário diretamente');
    return false;
}

async function main() {
    console.log('========================================');
    console.log('⏰ AGUARDAR RATE LIMIT E CRIAR USUÁRIO');
    console.log('📧 Titan Email SMTP - AlphaBit');
    console.log('========================================');
    console.log('');
    
    // Verificar rate limit atual
    const temRateLimit = await verificarRateLimit();
    
    if (temRateLimit) {
        console.log('\n⏳ Rate limit detectado. Iniciando processo de espera...');
        
        const resetado = await aguardarResetCompleto();
        
        if (!resetado) {
            console.log('\n❌ Não foi possível aguardar o reset do rate limit');
            console.log('🔧 Soluções alternativas:');
            console.log('   1. Execute: criar-usuario-sql-confirmacao.sql no SQL Editor');
            console.log('   2. Aguarde mais tempo (1-2 horas)');
            console.log('   3. Use outro IP/conexão');
            return;
        }
    } else {
        console.log('✅ Sem rate limit detectado. Prosseguindo...');
    }
    
    // Criar usuário final
    const resultado = await criarUsuarioFinal();
    
    if (resultado) {
        console.log('\n🎉 SUCESSO! Usuário criado e email enviado!');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Verificar email em suporte@alphabit.vu');
        console.log('   2. Clicar no link de confirmação');
        console.log('   3. Verificar confirmação no painel Supabase');
        console.log('   4. Testar login com as credenciais');
        
        console.log('\n📊 Credenciais para teste:');
        console.log(`   - Email: ${resultado.email}`);
        console.log(`   - Senha: ${resultado.password}`);
        
    } else {
        console.log('\n❌ Falha na criação do usuário');
        console.log('🔧 Use o script SQL como alternativa');
    }
    
    console.log('\n========================================');
    console.log('✅ Processo finalizado!');
    console.log('========================================');
}

// Executar
main().catch(console.error);