import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast'; // Temporarily disabled for debugging

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isImpersonating: boolean;
  impersonatedUser: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<any | null>(null);

  const isAdmin = user?.email === 'admin@clean.com' || user?.email === 'souzamkt0@gmail.com' || profile?.role === 'admin';

  useEffect(() => {
    // Check for impersonation mode
    const checkImpersonationMode = () => {
      const impersonationMode = localStorage.getItem('admin_impersonation_mode');
      const userData = localStorage.getItem('impersonated_user');
      
      if (impersonationMode === 'true' && userData) {
        try {
          const user = JSON.parse(userData);
          setIsImpersonating(true);
          setImpersonatedUser(user);
        } catch (error) {
          console.error('Erro ao carregar dados de impersonação:', error);
          localStorage.removeItem('admin_impersonation_mode');
          localStorage.removeItem('impersonated_user');
          localStorage.removeItem('admin_session_backup');
        }
      } else {
        setIsImpersonating(false);
        setImpersonatedUser(null);
      }
    };

    // Check for bypass session first
    const checkBypassSession = () => {
      const bypassSession = localStorage.getItem('bypass_session');
      if (bypassSession) {
        try {
          const sessionData = JSON.parse(bypassSession);
          if (sessionData.expires_at > Date.now()) {
            console.log('✅ Sessão bypass válida encontrada');
            setUser(sessionData.user);
            setSession(sessionData);
            setProfile(sessionData.profile);
            setIsLoading(false);
            return true;
          } else {
            console.log('🕐 Sessão bypass expirada, removendo...');
            localStorage.removeItem('bypass_session');
          }
        } catch (error) {
          console.error('Erro ao carregar sessão bypass:', error);
          localStorage.removeItem('bypass_session');
        }
      }
      return false;
    };

    // Se há sessão bypass válida, usar ela
    if (checkBypassSession()) {
      checkImpersonationMode();
      return;
    }

    // Set up auth state listener - VERSÃO ULTRA-SIMPLIFICADA
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change ULTRA-SIMPLIFICADO:', event, session?.user?.email || 'NO_USER');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Definir perfil básico quando usuário estiver logado
        if (session?.user) {
          console.log('✅ Usuário logado, buscando perfil completo...');
          
          // Buscar dados completos do perfil da tabela profiles
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              if (profileError) {
                console.warn('⚠️ Erro ao buscar perfil completo:', profileError);
                // Fallback para perfil básico
                setProfile({ 
                  role: (session.user.email === 'admin@clean.com' || session.user.email === 'souzamkt0@gmail.com') ? 'admin' : 'user', 
                  email: session.user.email,
                  user_id: session.user.id
                });
              } else {
                console.log('✅ Perfil completo carregado:', profileData);
                setProfile(profileData);
              }
            });
        } else {
          console.log('❌ Nenhum usuário, limpando estado');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session - VERSÃO SIMPLIFICADA
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Verificando sessão existente:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('✅ Sessão existente encontrada, buscando perfil completo...');
        
        // Buscar dados completos do perfil da tabela profiles
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            if (profileError) {
              console.warn('⚠️ Erro ao buscar perfil completo na sessão existente:', profileError);
              // Fallback para perfil básico
              setProfile({ 
                role: (session.user.email === 'admin@clean.com' || session.user.email === 'souzamkt0@gmail.com') ? 'admin' : 'user', 
                email: session.user.email,
                user_id: session.user.id
              });
            } else {
              console.log('✅ Perfil completo carregado na sessão existente:', profileData);
              setProfile(profileData);
            }
          });
      }
      
      setIsLoading(false);
    });

    // Check impersonation mode on mount
    checkImpersonationMode();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Iniciando processo de login...', { email });
      
      // Primeiro, limpar qualquer sessão corrompida
      console.log('🧹 Limpando estado antes do login...');
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Tentativa de login mais robusta
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Resposta do login:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        hasError: !!error,
        errorMessage: error?.message,
        userEmail: data?.user?.email
      });

      if (error) {
        console.error("❌ Erro no login:", error);
        
            // Limpeza completa em caso de erro persistente
            console.log('🔄 Tentando limpeza completa...');
            localStorage.clear();
            sessionStorage.clear();
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const finalAttempt = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (finalAttempt.error) {
              console.error('❌ Todas as tentativas falharam');
              return { error: new Error('Erro persistente no sistema de autenticação. Contate o suporte.') };
            }
            
            console.log('✅ Login bem-sucedido após limpeza!');
            return { error: null };
        
        return { error };
      }

      console.log('✅ Login bem-sucedido!');
      return { error: null };
    } catch (error: any) {
      console.error("❌ Erro interno no login:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('🔄 Iniciando cadastro...', { email, userData });
      
      // Criar o usuário no auth com os dados do usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            cpf: userData.cpf,
            whatsapp: userData.whatsapp,
            referral_code: userData.referralCode || null
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error("❌ Erro no cadastro:", error.message, error);
        
        // Tratar rate limiting
        if (error.message.includes('security purposes')) {
          return { error: { message: 'Aguarde alguns segundos antes de tentar novamente' } };
        }
        
        if (error.message.includes('already registered')) {
          return { error: { message: 'Este email já está cadastrado' } };
        }
        
        return { error: { message: `Erro no cadastro: ${error.message}` } };
      }

      console.log("✅ Usuário criado no auth com sucesso!", data);

      // CORREÇÃO: Como não conseguimos criar triggers em auth.users no Supabase,
      // vamos criar o perfil manualmente usando a função RPC
      if (data.user) {
        console.log('🔄 Criando perfil manualmente via RPC...');
        
        try {
          const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile_manual', {
            user_id_param: data.user.id,
            email_param: data.user.email,
            first_name_param: userData.firstName,
            last_name_param: userData.lastName,
            username_param: userData.username,
            cpf_param: userData.cpf,
            whatsapp_param: userData.whatsapp,
            referral_code_param: userData.referralCode || null
          });

          if (profileError) {
            console.error('❌ Erro ao criar perfil via RPC:', profileError);
            return { error: { message: `Erro ao criar perfil: ${profileError.message}` } };
          }

          if (profileResult && !profileResult.success) {
            console.error('❌ Falha na criação do perfil:', profileResult.error);
            return { error: { message: `Erro ao criar perfil: ${profileResult.error}` } };
          }

          console.log('✅ Perfil criado com sucesso via RPC!', profileResult);

          // Confirmar email automaticamente
          console.log('🔄 Confirmando email automaticamente...');
          const { error: confirmError } = await supabase.rpc('confirm_email_manual', {
            user_email: data.user.email
          });

          if (confirmError) {
            console.warn('⚠️ Aviso: Erro ao confirmar email automaticamente:', confirmError);
            // Não falhar o cadastro por causa da confirmação de email
          } else {
            console.log('✅ Email confirmado automaticamente!');
          }

        } catch (profileError) {
          console.error('❌ Erro interno ao criar perfil:', profileError);
          return { error: { message: 'Erro interno durante a criação do perfil' } };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("❌ Erro interno no cadastro:", error);
      return { error: { message: 'Erro interno durante o cadastro' } };
    }
  };



  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // Limpar também sessão bypass
    localStorage.removeItem('bypass_session');
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      isAdmin,
      isImpersonating,
      impersonatedUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};