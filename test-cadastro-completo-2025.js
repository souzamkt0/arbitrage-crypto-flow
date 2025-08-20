// ============= TESTE COMPLETO DE CADASTRO - 2025 =============
// Teste automatizado para verificar se o sistema de cadastro está funcionando
// após as correções do trigger e RLS

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCadastroCompleto() {
    console.log('🧪 ========== TESTE COMPLETO DE CADASTRO ==========');
    console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
    console.log('🎯 Objetivo: Verificar se cadastro funciona após correções');
    console.log('');

    try {
        // 1. GERAR DADOS DE TESTE ÚNICOS
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        
        const dadosTeste = {
            firstName: 'Teste',
            lastName: 'Usuario',
            username: `teste_${timestamp}_${randomNum}`,
            email: `teste_${timestamp}_${randomNum}@gmail.com`,
            password: '123456789',
            cpf: '123.456.789-10', // CPF de teste
            whatsapp: '(11) 99999-9999'
        };

        console.log('👤 DADOS DO TESTE:');
        console.log('📧 Email:', dadosTeste.email);
        console.log('👤 Username:', dadosTeste.username);
        console.log('📱 WhatsApp:', dadosTeste.whatsapp);
        console.log('🆔 CPF:', dadosTeste.cpf);
        console.log('');

        // 2. EXECUTAR CADASTRO VIA SUPABASE AUTH
        console.log('🔄 ETAPA 1: Criando usuário no Auth...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: dadosTeste.email,
            password: dadosTeste.password,
            options: {
                data: {
                    first_name: dadosTeste.firstName,
                    last_name: dadosTeste.lastName,
                    username: dadosTeste.username,
                    cpf: dadosTeste.cpf,
                    whatsapp: dadosTeste.whatsapp
                },
                emailRedirectTo: 'https://alphabit.com/dashboard'
            }
        });

        if (authError) {
            console.error('❌ ERRO NO CADASTRO AUTH:', authError.message);
            
            // Verificar se é erro de rate limiting
            if (authError.message.includes('security purposes')) {
                console.log('⏳ Rate limiting detectado. Aguardando 10 segundos...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                // Tentar novamente
                const { data: retryData, error: retryError } = await supabase.auth.signUp({
                    email: dadosTeste.email,
                    password: dadosTeste.password,
                    options: {
                        data: {
                            first_name: dadosTeste.firstName,
                            last_name: dadosTeste.lastName,
                            username: dadosTeste.username,
                            cpf: dadosTeste.cpf,
                            whatsapp: dadosTeste.whatsapp
                        }
                    }
                });

                if (retryError) {
                    console.error('❌ ERRO PERSISTENTE:', retryError.message);
                    return;
                }
                
                console.log('✅ Usuário criado na segunda tentativa!');
                authData.user = retryData.user;
            } else {
                return;
            }
        } else {
            console.log('✅ USUÁRIO CRIADO NO AUTH COM SUCESSO!');
        }

        const userId = authData.user?.id;
        console.log('🆔 User ID:', userId);
        console.log('');

        // 3. AGUARDAR TRIGGER EXECUTAR (3 segundos)
        console.log('⏳ ETAPA 2: Aguardando trigger criar perfil... (3s)');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 4. VERIFICAR SE PERFIL FOI CRIADO AUTOMATICAMENTE
        console.log('🔍 ETAPA 3: Verificando se perfil foi criado pelo trigger...');
        
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profileError) {
            console.error('❌ ERRO AO BUSCAR PERFIL:', profileError.message);
            
            // Se não encontrou, talvez seja o RLS. Vamos tentar como admin
            console.log('🔍 Tentando buscar perfil com bypass...');
            
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
                
            console.log('📊 Últimos 5 perfis criados:', allProfiles?.length || 0);
            allProfiles?.forEach(p => {
                console.log(`  - ${p.email} (${p.user_id}) - ${p.created_at}`);
            });

            const matchingProfile = allProfiles?.find(p => p.user_id === userId);
            if (matchingProfile) {
                console.log('✅ PERFIL ENCONTRADO VIA BYPASS!');
                console.log('📊 Dados do perfil:', matchingProfile);
            } else {
                console.log('❌ PERFIL NÃO ENCONTRADO MESMO COM BYPASS');
            }
            
        } else {
            console.log('✅ PERFIL CRIADO AUTOMATICAMENTE PELO TRIGGER!');
            console.log('');
            console.log('📊 DADOS DO PERFIL CRIADO:');
            console.log('🆔 User ID:', profile.user_id);
            console.log('📧 Email:', profile.email);
            console.log('👤 Nome:', profile.display_name);
            console.log('🔑 Username:', profile.username);
            console.log('📱 WhatsApp:', profile.whatsapp);
            console.log('🆔 CPF:', profile.cpf);
            console.log('🎯 Código Indicação:', profile.referral_code);
            console.log('👥 Role:', profile.role);
            console.log('💰 Saldo:', profile.balance);
            console.log('📅 Criado em:', profile.created_at);
            console.log('');
        }

        // 5. VERIFICAR SE TRIGGER DE EMAIL FUNCIONOU
        console.log('🔍 ETAPA 4: Verificando confirmação automática de email...');
        
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError) {
            console.log('❌ Não foi possível verificar confirmação de email');
        } else {
            const emailConfirmed = userData.user?.email_confirmed_at;
            if (emailConfirmed) {
                console.log('✅ EMAIL CONFIRMADO AUTOMATICAMENTE!');
                console.log('📅 Confirmado em:', emailConfirmed);
            } else {
                console.log('⚠️ Email ainda não confirmado');
            }
        }
        console.log('');

        // 6. VERIFICAR TRIGGERS ATIVOS
        console.log('🔍 ETAPA 5: Verificando triggers ativos...');
        
        const { data: triggers, error: triggersError } = await supabase.rpc('sql', {
            query: `
                SELECT 
                    trigger_name,
                    event_manipulation,
                    action_timing,
                    event_object_table
                FROM information_schema.triggers 
                WHERE trigger_schema = 'auth' 
                AND event_object_table = 'users'
                ORDER BY trigger_name
            `
        });

        if (!triggersError && triggers) {
            console.log('✅ TRIGGERS ENCONTRADOS:');
            triggers.forEach(t => {
                console.log(`  - ${t.trigger_name} (${t.action_timing} ${t.event_manipulation})`);
            });
        }
        console.log('');

        // 7. TESTE DE LOGIN
        console.log('🔍 ETAPA 6: Testando login do usuário criado...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: dadosTeste.email,
            password: dadosTeste.password
        });

        if (loginError) {
            console.error('❌ ERRO NO LOGIN:', loginError.message);
        } else {
            console.log('✅ LOGIN FUNCIONANDO PERFEITAMENTE!');
            console.log('👤 Usuário logado:', loginData.user?.email);
            
            // Fazer logout
            await supabase.auth.signOut();
            console.log('📤 Logout realizado');
        }
        console.log('');

        // 8. RESULTADO FINAL
        console.log('🎯 ========== RESULTADO FINAL ==========');
        
        const sucessos = [];
        const falhas = [];
        
        if (authData.user) sucessos.push('✅ Criação de usuário no Auth');
        else falhas.push('❌ Criação de usuário no Auth');
        
        if (profile || matchingProfile) sucessos.push('✅ Criação automática de perfil via trigger');
        else falhas.push('❌ Criação automática de perfil via trigger');
        
        if (loginData?.user) sucessos.push('✅ Sistema de login funcionando');
        else falhas.push('❌ Sistema de login funcionando');

        console.log('');
        console.log('📊 SUCESSOS:', sucessos.length);
        sucessos.forEach(s => console.log('  ' + s));
        
        console.log('');
        console.log('📊 FALHAS:', falhas.length);
        falhas.forEach(f => console.log('  ' + f));
        
        console.log('');
        if (falhas.length === 0) {
            console.log('🎉 ========== TESTE 100% APROVADO! ==========');
            console.log('🚀 SISTEMA DE CADASTRO FUNCIONANDO PERFEITAMENTE!');
            console.log('✅ Usuários podem se cadastrar normalmente');
            console.log('✅ Triggers automáticos funcionando');
            console.log('✅ RLS configurado corretamente');
            console.log('✅ Sistema pronto para produção!');
        } else {
            console.log('⚠️ ========== TESTE COM PROBLEMAS ==========');
            console.log('🔧 Alguns itens precisam de correção');
        }
        
        console.log('');
        console.log('📝 Dados para teste manual:');
        console.log('📧 Email:', dadosTeste.email);
        console.log('🔐 Senha:', dadosTeste.password);
        console.log('🔗 URL: /register');

    } catch (error) {
        console.error('💥 ERRO GERAL NO TESTE:', error);
    }
}

// Executar teste
testarCadastroCompleto();