// Verificar status do banco após correções
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 VERIFICANDO STATUS DO BANCO');
console.log('=' .repeat(40));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarStatusBanco() {
    try {
        console.log('\n1. 🗄️ Testando acesso à tabela profiles...');
        
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (profilesError) {
            console.log('❌ Erro ao acessar profiles:', profilesError.message);
        } else {
            console.log('✅ Acesso à tabela profiles: OK');
        }

        console.log('\n2. 📊 Verificando usuários existentes...');
        
        const { data: allProfiles, error: allError } = await supabase
            .from('profiles')
            .select('email, username, role')
            .limit(5);
            
        if (allError) {
            console.log('❌ Erro ao listar perfis:', allError.message);
        } else {
            console.log(`✅ Encontrados ${allProfiles?.length || 0} perfis:`);
            allProfiles?.forEach(profile => {
                console.log(`   - ${profile.email} (${profile.username}) - ${profile.role}`);
            });
        }

        console.log('\n3. 🧪 Testando inserção direta na tabela profiles...');
        
        const testProfile = {
            user_id: '00000000-0000-0000-0000-000000000001', // UUID fictício
            email: `test-direct-${Date.now()}@exemplo.com`,
            username: `testdirect${Date.now()}`,
            display_name: 'Teste Direto',
            role: 'user',
            balance: 0.00,
            total_profit: 0.00,
            status: 'active'
        };

        const { data: insertResult, error: insertError } = await supabase
            .from('profiles')
            .insert(testProfile)
            .select()
            .single();

        if (insertError) {
            console.log('❌ Erro na inserção direta:', insertError.message);
            console.log('   Detalhes:', insertError.details);
            
            if (insertError.message.includes('RLS')) {
                console.log('\n🔧 PROBLEMA: RLS ainda está ativo');
                console.log('   Execute: ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
            }
            
            if (insertError.message.includes('constraint')) {
                console.log('\n🔧 PROBLEMA: Constraint de chave estrangeira');
                console.log('   O trigger ainda está tentando validar user_id');
            }
        } else {
            console.log('✅ Inserção direta: OK');
            console.log('   Email:', insertResult.email);
            console.log('   Username:', insertResult.username);
            
            // Limpar teste
            await supabase
                .from('profiles')
                .delete()
                .eq('user_id', testProfile.user_id);
        }

        console.log('\n📋 STATUS ATUAL:');
        console.log('═══════════════════════════════════════');
        
        if (profilesError || allError || insertError) {
            console.log('❌ BANCO AINDA COM PROBLEMAS');
            console.log('');
            console.log('🔧 EXECUTE ESTE SQL NO PAINEL SUPABASE:');
            console.log('   https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/sql');
            console.log('');
            console.log('-- SQL DE CORREÇÃO URGENTE:');
            console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;');
            console.log('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
            console.log('ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;');
            console.log("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;");
        } else {
            console.log('✅ BANCO FUNCIONANDO CORRETAMENTE');
            console.log('   Problema pode estar na configuração de autenticação');
        }

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    }
}

verificarStatusBanco();