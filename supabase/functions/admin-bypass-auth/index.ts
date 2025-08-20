import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()
    
    console.log('🔄 Admin bypass auth request:', { email })

    // Verificar se é o admin específico
    if (email !== 'admin@clean.com' || password !== '123456') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciais inválidas para bypass' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Criar cliente Supabase para operações administrativas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar ou criar o usuário admin diretamente na tabela profiles
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // Usuário não existe, criar perfil
      console.log('📝 Criando perfil admin...')
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          email: email,
          display_name: 'Administrator',
          username: 'admin',
          role: 'admin',
          balance: 999999.00,
          total_profit: 0.00,
          status: 'active',
          bio: 'Administrador do sistema',
          avatar: 'avatar1',
          referral_code: 'ADMIN2024',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao criar perfil administrativo' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      profile = newProfile
    } else if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao acessar dados do perfil' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Criar token de sessão alternativo (usando dados do perfil)
    const sessionData = {
      user: {
        id: profile.user_id || profile.id,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at
      },
      profile: profile,
      access_token: `bypass_token_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      bypass_mode: true
    }

    console.log('✅ Admin bypass auth successful')

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: sessionData,
        message: 'Login bypass realizado com sucesso' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro na edge function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno na autenticação bypass' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})