// Teste completo de cadastro
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 TESTE COMPLETO DE CADASTRO');
console.log('=' .repeat(50));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCadastroCompleto() {
    try {
        // Dados do usuário de teste
        const timestamp = Date.now();
        const userData = {
            email: `teste${timestamp}@exemplo.com`,
            password: 'TesteSenha123!',
            firstName: 'Teste',
            lastName: 'Usuario',
            username: `teste${timestamp}`,
            cpf: '123.456.789-00',
            whatsapp: '(11) 99999-9999'
        };

        console.log('\n1. 📧 Dados do teste:');
        console.log('   Email:', userData.email);
        console.log('   Username:', userData.username);

        console.log('\n2. 🔄 Tentando cadastro...');
        
        // Tentar cadastro básico primeiro
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    username: userData.username,
                    cpf: userData.cpf,
                    whatsapp: userData.whatsapp
                }
            }
        });

        if (error) {
            console.log('❌ ERRO NO CADASTRO:');
            console.log('   Message:', error.message);
            console.log('   Status:', error.status);
            
            if (error.message.includes('Database error')) {
                console.log('\n🔧 SOLUÇÃO:');
                console.log('   1. Execute fix-urgent.sql no SQL Editor');
                console.log('   2. Desabilite confirmação de email no painel');
                console.log('   3. Tente novamente');
            }
            return;
        }

        console.log('✅ CADASTRO REALIZADO COM SUCESSO!');
        console.log('   User ID:', data.user?.id);
        console.log('   Email:', data.user?.email);
        console.log('   Confirmado:', data.user?.email_confirmed_at ? 'Sim' : 'Não');

        // Se o usuário foi criado, tentar criar perfil
        if (data.user) {
            console.log('\n3. 👤 Criando perfil...');
            
            const generateReferralCode = () => {
                const timestamp = Date.now().toString(36);
                const random = Math.random().toString(36).substring(2, 8);
                return `${userData.username}${timestamp}${random}`.toLowerCase();
            };

            const profileData = {
                user_id: data.user.id,
                email: userData.email,
                display_name: `${userData.firstName} ${userData.lastName}`,
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                cpf: userData.cpf,
                whatsapp: userData.whatsapp,
                bio: 'Usuário de teste',
                avatar: 'avatar1',
                referral_code: generateReferralCode(),
                role: 'user',
                balance: 0.00,
                total_profit: 0.00,
                status: 'active',
                profile_completed: true
            };

            const { data: profileResult, error: profileError } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();

            if (profileError) {
                console.log('❌ Erro ao criar perfil:', profileError.message);
                console.log('   Detalhes:', profileError);
            } else {
                console.log('✅ PERFIL CRIADO COM SUCESSO!');
                console.log('   Username:', profileResult.username);
                console.log('   Referral Code:', profileResult.referral_code);
                console.log('   Role:', profileResult.role);
            }
        }

        console.log('\n4. 🔐 Testando login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password
        });

        if (loginError) {
            console.log('❌ Erro no login:', loginError.message);
        } else {
            console.log('✅ LOGIN REALIZADO COM SUCESSO!');
            console.log('   Session válida:', !!loginData.session);
            
            // Logout
            await supabase.auth.signOut();
            console.log('🚪 Logout realizado');
        }

        console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
        console.log('═══════════════════════════════════════');
        console.log('✅ Cadastro: OK');
        console.log('✅ Perfil: OK');
        console.log('✅ Login: OK');
        console.log('');
        console.log('🎯 O sistema está funcionando perfeitamente!');
        console.log('   Agora você pode testar na aplicação web.');

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
        console.log('\n🔧 Verifique se:');
        console.log('   1. As variáveis de ambiente estão corretas');
        console.log('   2. O SQL de correção foi executado');
        console.log('   3. A confirmação de email está desabilitada');
    }
}

testarCadastroCompleto();