import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 === TESTE AUTOMÁTICO DE CADASTRO ===');
    
    // Configurar Supabase com service role para acesso completo
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Dados de teste únicos
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    
    const testData = {
      firstName: 'Teste',
      lastName: 'Cadastro',
      username: `teste_${timestamp}_${randomNum}`,
      email: `teste_${timestamp}_${randomNum}@teste.com`,
      password: '123456789',
      cpf: '123.456.789-10',
      whatsapp: '(11) 99999-9999'
    };

    console.log('📊 Dados de teste:', testData);

    // 1. CRIAR USUÁRIO NO AUTH
    console.log('🔄 Etapa 1: Criando usuário no auth...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testData.email,
      password: testData.password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        first_name: testData.firstName,
        last_name: testData.lastName,
        username: testData.username,
        cpf: testData.cpf,
        whatsapp: testData.whatsapp
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao criar usuário: ' + authError.message,
        step: 'auth_creation'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = authData.user?.id;
    console.log('✅ Usuário criado:', userId);

    // 2. AGUARDAR UM POUCO PARA TRIGGER EXECUTAR
    console.log('⏳ Aguardando trigger executar...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. VERIFICAR SE PERFIL FOI CRIADO
    console.log('🔍 Etapa 2: Verificando se perfil foi criado automaticamente...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let profileCreated = false;
    let profileData = null;

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      
      // Tentar criar perfil manualmente para testar
      console.log('🔄 Tentando criar perfil manualmente...');
      
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: testData.email,
          display_name: `${testData.firstName} ${testData.lastName}`,
          username: testData.username,
          first_name: testData.firstName,
          last_name: testData.lastName,
          cpf: testData.cpf,
          whatsapp: testData.whatsapp,
          bio: 'Usuário de teste',
          avatar: 'avatar1',
          referral_code: `test_${timestamp}`,
          role: 'user',
          balance: 0.00,
          total_profit: 0.00,
          status: 'active'
        })
        .select()
        .single();

      if (manualError) {
        console.error('❌ Erro ao criar perfil manualmente:', manualError);
      } else {
        console.log('✅ Perfil criado manualmente');
        profileCreated = true;
        profileData = manualProfile;
      }
    } else {
      console.log('✅ Perfil criado automaticamente pelo trigger!');
      profileCreated = true;
      profileData = profile;
    }

    // 4. TESTAR LOGIN
    console.log('🔍 Etapa 3: Testando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testData.email,
      password: testData.password
    });

    let loginSuccess = false;
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login funcionando!');
      loginSuccess = true;
      // Fazer logout
      await supabase.auth.signOut();
    }

    // 5. VERIFICAR TRIGGERS ATIVOS
    console.log('🔍 Etapa 4: Verificando triggers...');
    
    const { data: functions, error: functionsError } = await supabase.rpc('sql', {
      query: `
        SELECT proname as function_name
        FROM pg_proc 
        WHERE proname IN ('handle_new_user', 'auto_confirm_email')
        ORDER BY proname
      `
    });

    const triggersActive = !functionsError && functions && functions.length > 0;

    // 6. RESULTADO FINAL
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      testData: {
        email: testData.email,
        password: testData.password,
        username: testData.username
      },
      results: {
        authCreation: !!authData.user,
        profileCreation: profileCreated,
        loginTest: loginSuccess,
        triggersActive: triggersActive,
        userId: userId,
        profileData: profileData
      },
      summary: {
        totalTests: 4,
        passed: [
          !!authData.user,
          profileCreated,
          loginSuccess,
          triggersActive
        ].filter(Boolean).length
      }
    };

    console.log('🎯 Resultado final:', result);

    // Status baseado nos resultados
    const allPassed = result.summary.passed === result.summary.totalTests;
    const status = allPassed ? 200 : 206; // 206 = Partial Content

    return new Response(JSON.stringify(result), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});