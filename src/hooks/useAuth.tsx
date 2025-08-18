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

  const isAdmin = user?.email === 'souzamkt0@gmail.com' || profile?.role === 'admin';

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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setProfile(profileData);
            
            // Verificar se estamos na porta correta
            if (window.location.port !== '8080' && window.location.port !== '') {
              console.log('⚠️ Porta incorreta detectada:', window.location.port);
              console.log('🔄 Redirecionando para porta 8080...');
              window.location.href = `http://localhost:8080${window.location.pathname}`;
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setProfile(profileData);
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    // Check impersonation mode on mount
    checkImpersonationMode();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro no login:", error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('🔄 Iniciando cadastro...', { email, userData });
      
      // Criar o usuário no auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirmed: true
          }
        }
      });

      if (error) {
        console.error("❌ Erro no cadastro:", error.message, error);
        return { error: { message: `Erro no cadastro: ${error.message}` } };
      }

      console.log("✅ Usuário criado no auth com sucesso!", data);

      // Se o usuário foi criado, criar o perfil básico
      if (data.user && data.user.id) {
        console.log('🔄 Criando perfil básico...');
        
        try {
          // Aguardar um pouco para garantir que o usuário foi criado
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Gerar código de indicação único
          const generateReferralCode = () => {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 8);
            return `${userData.username || 'user'}${timestamp}${random}`.toLowerCase();
          };

          // Criar perfil básico (sem informações completas)
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: data.user.email,
              display_name: null, // Será preenchido na página de completar perfil
              username: userData.username || data.user.email?.split('@')[0] || 'user',
              first_name: null, // Será preenchido na página de completar perfil
              last_name: null, // Será preenchido na página de completar perfil
              cpf: null, // Será preenchido na página de completar perfil
              whatsapp: null, // Será preenchido na página de completar perfil
              bio: null,
              avatar: 'avatar1',
              referral_code: generateReferralCode(),
              referred_by: userData.referralCode || null,
              role: 'user',
              balance: 0.00,
              total_profit: 0.00,
              status: 'active',
              profile_completed: false // Marcar como não completo
            });

          if (profileError) {
            console.error('❌ Erro criando perfil:', profileError);
            return { error: { message: `Database error saving new user: ${profileError.message}` } };
          } else {
            console.log('✅ Perfil básico criado com sucesso!');
          }

        } catch (profileError) {
          console.error('❌ Erro na criação de perfil:', profileError);
          return { error: { message: 'Database error saving new user' } };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("❌ Erro interno no cadastro:", error);
      return { error: { message: 'Internal error during registration' } };
    }
  };



  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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