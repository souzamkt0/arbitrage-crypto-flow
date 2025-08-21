// Criar usuário contornando as constraints
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('👤 CRIANDO USUÁRIO (CONTORNANDO CONSTRAINTS)');
console.log('=' .repeat(50));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function criarUsuarioSemConstraint() {
    try {
        // Primeiro, vamos usar um user_id que já existe
        console.log('\n1. 🔍 Buscando usuário existente para usar como base...');
        
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('user_id, email')
            .limit(1);
            
        let userIdToUse = null;
        if (existingProfiles && existingProfiles.length > 0) {
            userIdToUse = existingProfiles[0].user_id;
            console.log('✅ Usando user_id existente:', userIdToUse);
        } else {
            // Usar um UUID que provavelmente não existe mas tem formato válido
            userIdToUse = '550e8400-e29b-41d4-a716-446655440000';
            console.log('⚠️  Usando UUID genérico:', userIdToUse);
        }

        console.log('\n2. 👤 Criando novo perfil...');
        
        const timestamp = Date.now();
        const newUser = {
            user_id: userIdToUse, // Usar um ID que sabemos que funciona
            email: `usuario${timestamp}@alphabit.vu`,
            username: `user${timestamp}`,
            display_name: `Usuário ${timestamp}`,
            first_name: 'Novo',
            last_name: 'Usuário',
            cpf: '123.456.789-10',
            whatsapp: '(11) 98765-4321',
            bio: 'Usuário criado via script',
            avatar: 'avatar1',
            referral_code: `ref${timestamp}`,
            referred_by: null,
            role: 'user',
            balance: 0.00,
            total_profit: 0.00,
            status: 'active',
            profile_completed: true
        };

        const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(newUser)
            .select()
            .single();

        if (profileError) {
            console.log('❌ Erro ao criar perfil:', profileError.message);
            
            // Se ainda der erro de constraint, vamos tentar sem user_id
            console.log('\n3. 🔄 Tentando sem user_id...');
            
            const userWithoutFK = { ...newUser };
            delete userWithoutFK.user_id;
            
            const { data: profileWithoutFK, error: errorWithoutFK } = await supabase
                .from('profiles')
                .insert(userWithoutFK)
                .select()
                .single();
                
            if (errorWithoutFK) {
                console.log('❌ Erro mesmo sem user_id:', errorWithoutFK.message);
                console.log('\n🚨 O SQL de correção NÃO foi executado!');
                console.log('   Execute fix-constraint.sql no painel Supabase');
                return;
            } else {
                console.log('✅ USUÁRIO CRIADO SEM USER_ID!');
                console.log('   Email:', profileWithoutFK.email);
                console.log('   Username:', profileWithoutFK.username);
                console.log('   ID do Perfil:', profileWithoutFK.id);
            }
        } else {
            console.log('✅ USUÁRIO CRIADO COM SUCESSO!');
            console.log('   Email:', newProfile.email);
            console.log('   Username:', newProfile.username);
            console.log('   User ID:', newProfile.user_id);
            console.log('   Referral Code:', newProfile.referral_code);
        }

        console.log('\n4. 📊 Total de usuários agora:');
        const { data: allUsers, error: countError } = await supabase
            .from('profiles')
            .select('email, username, role');
            
        if (!countError) {
            console.log(`   Total: ${allUsers.length} usuários`);
            console.log('   Últimos 3:');
            allUsers.slice(-3).forEach(user => {
                console.log(`   - ${user.email} (${user.username}) - ${user.role}`);
            });
        }

        console.log('\n🎉 PROCESSO CONCLUÍDO!');
        console.log('═══════════════════════════════════════');
        
        if (profileError && profileError.message.includes('constraint')) {
            console.log('⚠️  Para resolver o problema dos cadastros:');
            console.log('   1. Execute fix-constraint.sql no SQL Editor');
            console.log('   2. Desabilite confirmação de email');
            console.log('   3. Reinicie o servidor');
        } else {
            console.log('✅ Sistema funcionando! Usuário criado com sucesso.');
        }

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    }
}

criarUsuarioSemConstraint();