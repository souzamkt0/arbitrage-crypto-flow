// Solução simples - testar sem triggers
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 SOLUÇÃO SIMPLES PARA CADASTRO');
console.log('=' .repeat(40));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleFix() {
    try {
        console.log('\n📋 INSTRUÇÕES MANUAIS:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix');
        console.log('2. Vá em: Authentication > Settings');
        console.log('3. DESMARQUE: "Enable email confirmations"');
        console.log('4. Clique: "Save"');
        console.log('');
        console.log('5. Vá em: SQL Editor');
        console.log('6. Execute este SQL:');
        console.log('');
        console.log('-- REMOVER TODOS OS TRIGGERS PROBLEMÁTICOS');
        console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
        console.log('DROP FUNCTION IF EXISTS handle_new_user();');
        console.log('DROP FUNCTION IF EXISTS create_user_profile_definitive();');
        console.log('');
        console.log('-- DESABILITAR RLS TEMPORARIAMENTE');
        console.log('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- CONFIRMAR USUÁRIOS EXISTENTES');
        console.log("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;");
        console.log('');
        
        console.log('✅ APÓS EXECUTAR O SQL:');
        console.log('   - Cadastros funcionarão sem triggers');
        console.log('   - Perfis serão criados pela aplicação');
        console.log('   - Não haverá confirmação de email');
        console.log('');
        console.log('🧪 TESTE O CADASTRO AGORA!');
        
        // Verificar se conseguimos acessar a tabela profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (error) {
            console.log('\n⚠️  Nota: Erro ao acessar profiles:', error.message);
        } else {
            console.log('\n✅ Conexão com profiles OK');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testSimpleFix();