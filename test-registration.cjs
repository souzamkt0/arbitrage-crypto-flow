const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
    console.log('Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão no arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
    console.log('🔍 Testando sistema de cadastro...');
    
    // Email de teste único
    const testEmail = `teste${Date.now()}@exemplo.com`;
    const testPassword = 'senha123456';
    
    try {
        console.log(`\n📧 Tentando cadastrar: ${testEmail}`);
        
        // Tentar cadastrar usuário
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Usuário Teste'
                }
            }
        });
        
        if (error) {
            console.error('❌ Erro no cadastro:', error.message);
            console.error('Código do erro:', error.status);
            console.error('Detalhes:', error);
            
            if (error.message.includes('Database error')) {
                console.log('\n🔧 SOLUÇÃO NECESSÁRIA:');
                console.log('1. Vá para o Supabase Dashboard > SQL Editor');
                console.log('2. Execute o script recreate-profiles-complete.sql');
                console.log('3. Verifique se não há erros na execução');
                console.log('4. Teste o cadastro novamente');
            }
            
            return false;
        }
        
        console.log('✅ Cadastro realizado com sucesso!');
        console.log('Usuário ID:', data.user?.id);
        console.log('Email confirmado:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
        
        // Verificar se o perfil foi criado
        if (data.user?.id) {
            console.log('\n🔍 Verificando criação do perfil...');
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            if (profileError) {
                console.error('❌ Erro ao buscar perfil:', profileError.message);
                return false;
            }
            
            if (profile) {
                console.log('✅ Perfil criado automaticamente!');
                console.log('Dados do perfil:', profile);
            } else {
                console.log('⚠️ Perfil não foi criado automaticamente');
            }
        }
        
        return true;
        
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
        return false;
    }
}

async function checkEmailSettings() {
    console.log('\n📧 Verificando configurações de email...');
    
    try {
        // Tentar obter configurações (limitado pela API)
        console.log('ℹ️ Para verificar configurações de email:');
        console.log('1. Vá para Supabase Dashboard > Authentication > Settings');
        console.log('2. Verifique se "Enable email confirmations" está ativado');
        console.log('3. Configure o provedor SMTP se necessário');
        
    } catch (err) {
        console.log('⚠️ Não foi possível verificar configurações automaticamente');
    }
}

async function main() {
    console.log('🚀 Iniciando teste completo do sistema de cadastro\n');
    
    // Verificar conexão
    console.log('🔗 Testando conexão com Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
        console.error('❌ Erro de conexão:', error.message);
        console.log('\n🔧 AÇÃO NECESSÁRIA:');
        console.log('Execute o script recreate-profiles-complete.sql no Supabase Dashboard');
        return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Testar cadastro
    const success = await testRegistration();
    
    // Verificar configurações de email
    await checkEmailSettings();
    
    if (success) {
        console.log('\n🎉 Sistema de cadastro funcionando corretamente!');
    } else {
        console.log('\n❌ Sistema de cadastro com problemas - execute o script SQL primeiro');
    }
}

main().catch(console.error);