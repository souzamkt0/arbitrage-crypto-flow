// Teste de login direto do usuário souzamkt0
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔐 TESTE DE LOGIN DIRETO - SOUZAMKT0');
console.log('=' .repeat(50));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarLoginDireto() {
  try {
    console.log('1️⃣ Testando login com souzamkt0@gmail.com...\n');
    
    // Tentar diferentes senhas comuns para teste
    const senhasTeste = [
      'souzamkt0',
      'Souzamkt0',
      'SOUZAMKT0',
      'souzamkt0123',
      'Souzamkt0123',
      '123456',
      'senha123',
      'admin123',
      'alphabit',
      'Alphabit123',
      'teste123'
    ];
    
    let loginSucesso = false;
    let senhaCorreta = '';
    
    for (const senha of senhasTeste) {
      console.log(`🔍 Testando senha: ${senha.replace(/./g, '*')}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'souzamkt0@gmail.com',
        password: senha,
      });
      
      if (!error && data.user) {
        console.log(`✅ LOGIN SUCESSO com senha: ${senha}`);
        console.log('👤 User ID:', data.user.id);
        console.log('📧 Email:', data.user.email);
        console.log('✅ Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
        console.log('🕐 Último login:', data.user.last_sign_in_at);
        
        loginSucesso = true;
        senhaCorreta = senha;
        
        // Fazer logout para não interferir em outros testes
        await supabase.auth.signOut();
        break;
      } else if (error) {
        if (error.message.includes('Invalid login credentials')) {
          console.log('❌ Senha incorreta');
        } else if (error.message.includes('Email not confirmed')) {
          console.log('⚠️  Email não confirmado - mas usuário existe!');
          console.log('🔧 PROBLEMA: Email precisa ser confirmado');
          
          // Tentar confirmar email automaticamente
          console.log('\n2️⃣ Tentando confirmar email automaticamente...');
          
          // Usar service key se disponível para confirmar email
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (serviceKey && serviceKey !== SUPABASE_ANON_KEY) {
            const supabaseAdmin = createClient(SUPABASE_URL, serviceKey);
            
            try {
              // Confirmar email via SQL
              const { data: updateResult, error: updateError } = await supabaseAdmin
                .from('auth.users')
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq('email', 'souzamkt0@gmail.com');
              
              if (!updateError) {
                console.log('✅ Email confirmado via service key');
                
                // Tentar login novamente
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                  email: 'souzamkt0@gmail.com',
                  password: senha,
                });
                
                if (!loginError && loginData.user) {
                  console.log(`✅ LOGIN SUCESSO após confirmar email com senha: ${senha}`);
                  loginSucesso = true;
                  senhaCorreta = senha;
                  await supabase.auth.signOut();
                  break;
                }
              } else {
                console.log('❌ Erro ao confirmar email:', updateError.message);
              }
            } catch (adminError) {
              console.log('❌ Erro ao usar service key:', adminError.message);
            }
          }
          
          break;
        } else {
          console.log('❌ Erro:', error.message);
        }
      }
    }
    
    if (!loginSucesso) {
      console.log('\n❌ NENHUMA SENHA FUNCIONOU');
      console.log('🔧 POSSÍVEIS SOLUÇÕES:');
      console.log('   1. Confirmar email via painel Supabase');
      console.log('   2. Resetar senha via interface');
      console.log('   3. Criar nova senha via SQL');
      console.log('   4. Verificar se usuário existe no auth.users');
      
      // Verificar se email precisa ser confirmado
      console.log('\n3️⃣ Verificando status do email...');
      
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey && serviceKey !== SUPABASE_ANON_KEY) {
        const supabaseAdmin = createClient(SUPABASE_URL, serviceKey);
        
        try {
          const { data: authUsers, error: authError } = await supabaseAdmin
            .from('auth.users')
            .select('id, email, email_confirmed_at, created_at')
            .eq('email', 'souzamkt0@gmail.com');
          
          if (authError) {
            console.log('❌ Erro ao verificar auth.users:', authError.message);
          } else if (authUsers && authUsers.length > 0) {
            const user = authUsers[0];
            console.log('✅ Usuário encontrado no auth.users:');
            console.log('   ID:', user.id);
            console.log('   Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');
            console.log('   Criado em:', user.created_at);
            
            if (!user.email_confirmed_at) {
              console.log('\n🔧 EXECUTANDO CORREÇÃO AUTOMÁTICA...');
              
              const { error: confirmError } = await supabaseAdmin
                .from('auth.users')
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq('email', 'souzamkt0@gmail.com');
              
              if (!confirmError) {
                console.log('✅ Email confirmado automaticamente!');
                console.log('🔄 Tente fazer login novamente com qualquer uma das senhas testadas');
              } else {
                console.log('❌ Erro ao confirmar email:', confirmError.message);
              }
            }
          } else {
            console.log('❌ Usuário NÃO encontrado no auth.users');
            console.log('🔧 Execute: correcao-souzamkt0-definitiva.sql');
          }
        } catch (error) {
          console.log('❌ Erro ao verificar status:', error.message);
        }
      }
    } else {
      console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log(`🔑 Senha que funcionou: ${senhaCorreta}`);
      console.log('🎉 O usuário souzamkt0 consegue fazer login normalmente!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Executar teste
testarLoginDireto();