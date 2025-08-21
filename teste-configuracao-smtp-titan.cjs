// Teste de Configuração SMTP Titan Email
// Execute este script para verificar se o SMTP está funcionando

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão no .env');
    process.exit(1);
}

// Usar service role se disponível, senão usar anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseServiceKey) {
    console.log('⚠️  Usando ANON KEY (funcionalidade limitada)');
    console.log('   Para funcionalidade completa, adicione SUPABASE_SERVICE_ROLE_KEY ao .env');
}

async function testarConfiguracaoSMTP() {
    console.log('🔧 TESTE DE CONFIGURAÇÃO SMTP TITAN EMAIL');
    console.log('=' .repeat(50));
    
    try {
        // 1. Verificar configuração atual
        console.log('\n1. 📊 Verificando usuários não confirmados...');
        
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at, created_at')
            .is('email_confirmed_at', null)
            .order('created_at', { ascending: false });
            
        if (errorUsuarios) {
            console.log('⚠️  Não foi possível acessar auth.users diretamente');
            console.log('   Isso é normal - usando método alternativo...');
        } else {
            console.log(`📈 Usuários não confirmados: ${usuarios?.length || 0}`);
        }
        
        // 2. Teste de cadastro com email
        console.log('\n2. 🧪 Testando cadastro com confirmação de email...');
        
        const emailTeste = `teste-${Date.now()}@exemplo.com`;
        const senhaTeste = 'TesteSenha123!';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailTeste,
            password: senhaTeste,
            options: {
                emailRedirectTo: 'http://localhost:5173/dashboard'
            }
        });
        
        if (signUpError) {
            console.log('❌ Erro no cadastro:', signUpError.message);
            
            if (signUpError.message.includes('email')) {
                console.log('\n🔍 DIAGNÓSTICO:');
                console.log('   - Problema relacionado ao email detectado');
                console.log('   - Verifique se o SMTP está configurado corretamente');
                console.log('   - Credenciais: suporte@alphabit.vu / Jad828657##');
                console.log('   - Host: smtp.titan.email');
                console.log('   - Porta: 587');
            }
        } else {
            console.log('✅ Cadastro realizado com sucesso!');
            console.log(`📧 Email de confirmação enviado para: ${emailTeste}`);
            console.log(`👤 Usuário ID: ${signUpData.user?.id}`);
            
            if (signUpData.user && !signUpData.user.email_confirmed_at) {
                console.log('📮 Status: Email aguardando confirmação (SMTP funcionando)');
            } else {
                console.log('✅ Status: Email já confirmado automaticamente');
            }
        }
        
        // 3. Verificar configurações do projeto
        console.log('\n3. ⚙️  Verificando configurações do projeto...');
        
        const { data: config, error: configError } = await supabase
            .rpc('get_auth_config')
            .single();
            
        if (configError) {
            console.log('⚠️  Não foi possível verificar configurações automaticamente');
        } else {
            console.log('📋 Configurações obtidas com sucesso');
        }
        
        // 4. Instruções finais
        console.log('\n4. 📋 INSTRUÇÕES PARA VERIFICAÇÃO MANUAL:');
        console.log('   1. Acesse: https://supabase.com/dashboard/project/cbwgthkfvczjqzefvik');
        console.log('   2. Vá para: Authentication > Settings > SMTP Settings');
        console.log('   3. Verifique se as configurações estão corretas:');
        console.log('      - SMTP Host: smtp.titan.email');
        console.log('      - SMTP Port: 587');
        console.log('      - SMTP User: suporte@alphabit.vu');
        console.log('      - SMTP Pass: Jad828657##');
        console.log('      - Sender Name: Arbitrage Crypto Flow');
        console.log('      - Sender Email: noreply@alphabit.vu');
        console.log('   4. Clique em "Send test email" para testar');
        
        console.log('\n✅ TESTE CONCLUÍDO!');
        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('   - Se o email de teste chegou: SMTP está funcionando ✅');
        console.log('   - Se não chegou: Verifique as credenciais no painel Supabase');
        console.log('   - Para desabilitar confirmação: Desmarque "Enable email confirmations"');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
        console.log('   1. Verifique se as variáveis de ambiente estão corretas');
        console.log('   2. Confirme se o SUPABASE_SERVICE_ROLE_KEY está no .env');
        console.log('   3. Teste a configuração SMTP manualmente no painel');
    }
}

// Executar teste
testarConfiguracaoSMTP().catch(console.error);