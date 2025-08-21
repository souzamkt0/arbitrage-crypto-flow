// Desabilitar confirmação de email temporariamente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 DESABILITANDO CONFIRMAÇÃO DE EMAIL');
console.log('=' .repeat(50));

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableEmailConfirmation() {
    try {
        console.log('\n1. 🔍 Verificando usuários não confirmados...');
        
        // Confirmar todos os usuários existentes
        const { data: users, error: usersError } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at')
            .is('email_confirmed_at', null);
            
        if (!usersError && users) {
            console.log(`📊 Encontrados ${users.length} usuários não confirmados`);
            
            // Confirmar todos
            for (const user of users) {
                await supabase.auth.admin.updateUserById(user.id, {
                    email_confirm: true
                });
                console.log(`✅ Confirmado: ${user.email}`);
            }
        }
        
        console.log('\n2. 🧪 Testando cadastro sem confirmação...');
        
        const testEmail = `test-no-confirm-${Date.now()}@exemplo.com`;
        const { data, error } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TesteSenha123!',
            email_confirm: true, // Confirmar automaticamente
            user_metadata: {
                first_name: 'Teste',
                last_name: 'NoConfirm'
            }
        });
        
        if (error) {
            console.log('❌ Erro no cadastro admin:', error.message);
        } else {
            console.log('✅ Usuário criado e confirmado automaticamente!');
            console.log('📧 Email:', testEmail);
            console.log('👤 ID:', data.user?.id);
            
            // Criar perfil manualmente
            const profileData = {
                user_id: data.user.id,
                email: testEmail,
                display_name: 'Teste NoConfirm',
                username: 'testnoconfirm',
                first_name: 'Teste',
                last_name: 'NoConfirm',
                bio: 'Usuário de teste',
                avatar: 'avatar1',
                referral_code: `test${Date.now()}`,
                role: 'user',
                balance: 0.00,
                total_profit: 0.00,
                status: 'active',
                profile_completed: true
            };
            
            const { error: profileError } = await supabase
                .from('profiles')
                .insert(profileData);
                
            if (profileError) {
                console.log('❌ Erro ao criar perfil:', profileError.message);
            } else {
                console.log('✅ Perfil criado com sucesso!');
            }
        }
        
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. No painel Supabase:');
        console.log('   Authentication > Settings');
        console.log('   DESMARQUE "Enable email confirmations"');
        console.log('   Clique "Save"');
        console.log('');
        console.log('2. Teste o cadastro na aplicação');
        console.log('   Deve funcionar sem necessidade de confirmação');
        console.log('');
        console.log('3. Para reabilitar depois:');
        console.log('   Configure SMTP primeiro');
        console.log('   Depois marque "Enable email confirmations"');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

disableEmailConfirmation();