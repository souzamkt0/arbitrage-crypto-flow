// Debug de cadastro - Testar diretamente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 DEBUG CADASTRO');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'OK' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSignup() {
    try {
        console.log('\n🧪 Testando cadastro básico...');
        
        const testEmail = `debug-${Date.now()}@teste.com`;
        const testPassword = 'TesteSenha123!';
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    first_name: 'Teste',
                    last_name: 'Debug',
                    username: 'testdebug'
                },
                emailRedirectTo: 'http://localhost:8080/dashboard'
            }
        });
        
        if (error) {
            console.log('❌ ERRO DETALHADO:');
            console.log('   Message:', error.message);
            console.log('   Code:', error.status);
            console.log('   Details:', error);
            
            if (error.message.includes('Database error')) {
                console.log('\n🔧 SOLUÇÃO: Execute definitive-fix.sql');
            }
        } else {
            console.log('✅ Cadastro OK!');
            console.log('   User ID:', data.user?.id);
            console.log('   Email:', data.user?.email);
            console.log('   Confirmed:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
        }
        
    } catch (e) {
        console.log('❌ Erro inesperado:', e.message);
    }
}

debugSignup();