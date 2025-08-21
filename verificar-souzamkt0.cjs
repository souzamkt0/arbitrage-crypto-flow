// Verificar usuário souzamkt0@gmail.com
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 VERIFICANDO USUÁRIO: souzamkt0@gmail.com');
console.log('=' .repeat(50));

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    process.exit(1);
}

// Usar service role se disponível
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarUsuario() {
    try {
        console.log('\n1. 🔍 Verificando se usuário existe...');
        
        // Tentar fazer login para verificar se existe
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'souzamkt0@gmail.com',
            password: 'senha_temporaria_teste'
        });
        
        if (loginError) {
            if (loginError.message.includes('Invalid login credentials')) {
                console.log('✅ Usuário existe, mas senha incorreta (normal)');
            } else if (loginError.message.includes('Email not confirmed')) {
                console.log('⚠️  Usuário existe mas email não confirmado');
                console.log('🔧 SOLUÇÃO: Confirmar email ou desabilitar confirmação');
            } else {
                console.log('❌ Erro:', loginError.message);
            }
        } else {
            console.log('✅ Login bem-sucedido!');
            console.log('👤 Usuário ID:', loginData.user?.id);
        }
        
        console.log('\n2. 📧 Testando envio de email de reset...');
        
        const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
            'souzamkt0@gmail.com',
            {
                redirectTo: 'http://localhost:3000/reset-password'
            }
        );
        
        if (resetError) {
            console.log('❌ Erro no envio de email:', resetError.message);
            
            if (resetError.message.includes('SMTP')) {
                console.log('\n🔧 PROBLEMA SMTP DETECTADO:');
                console.log('   - Verifique configuração SMTP no painel Supabase');
                console.log('   - Host: smtp.titan.email');
                console.log('   - Port: 587');
                console.log('   - User: suporte@alphabit.vu');
                console.log('   - Pass: Jad828657##');
            }
        } else {
            console.log('✅ Email de reset enviado com sucesso!');
            console.log('📧 Verifique a caixa de entrada de souzamkt0@gmail.com');
        }
        
        console.log('\n3. 👤 Verificando perfil...');
        
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'souzamkt0@gmail.com')
            .limit(1);
            
        if (profileError) {
            console.log('❌ Erro ao buscar perfil:', profileError.message);
        } else if (profiles && profiles.length > 0) {
            console.log('✅ Perfil encontrado:');
            console.log('   - Email:', profiles[0].email);
            console.log('   - Username:', profiles[0].username);
            console.log('   - Role:', profiles[0].role);
            console.log('   - Referral Code:', profiles[0].referral_code);
        } else {
            console.log('⚠️  Perfil não encontrado');
            console.log('🔧 SOLUÇÃO: Execute o SQL de correção (definitive-fix.sql)');
        }
        
        console.log('\n4. 🧪 Teste de cadastro novo (para testar SMTP)...');
        
        const testEmail = `teste-${Date.now()}@exemplo.com`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TesteSenha123!',
            options: {
                emailRedirectTo: 'http://localhost:3000/dashboard'
            }
        });
        
        if (signUpError) {
            console.log('❌ Erro no cadastro teste:', signUpError.message);
            
            if (signUpError.message.includes('Database error')) {
                console.log('\n🔧 SOLUÇÃO:');
                console.log('   1. Execute definitive-fix.sql no SQL Editor');
                console.log('   2. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/sql');
            }
        } else {
            console.log('✅ Cadastro teste funcionando!');
            console.log('📧 Email:', testEmail);
            console.log('👤 ID:', signUpData.user?.id);
        }
        
        console.log('\n📋 RESUMO:');
        console.log('═══════════════════════════════════════════════════');
        console.log('🎯 PRÓXIMOS PASSOS:');
        console.log('   1. Configure SMTP no painel Supabase');
        console.log('   2. Execute definitive-fix.sql se houver erro de database');
        console.log('   3. Teste envio de email para souzamkt0@gmail.com');
        console.log('   4. Verifique se emails chegam na caixa de entrada');
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    }
}

verificarUsuario().catch(console.error);