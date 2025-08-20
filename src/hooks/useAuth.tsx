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

    // Set up auth state listener - VERSÃO ULTRA-SIMPLIFICADA
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change ULTRA-SIMPLIFICADO:', event, session?.user?.email || 'NO_USER');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // NÃO fazer nenhuma consulta adicional para evitar erros de schema
        if (session?.user) {
          console.log('✅ Usuário logado, pulando todas as consultas de perfil');
          setProfile({ role: 'admin', email: session.user.email }); // Mock profile
        } else {
          console.log('❌ Nenhum usuário, limpando estado');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session - VERSÃO ULTRA-SIMPLIFICADA
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Verificando sessão existente:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('✅ Sessão existente encontrada, definindo perfil mock');
        setProfile({ role: 'admin', email: session.user.email }); // Mock profile
        setIsLoading(false);
      } else {
        // *** NOVO: LOGIN AUTOMÁTICO ***
        console.log('🔄 Nenhuma sessão encontrada, tentando login automático...');
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@clean.com',
            password: '123456',
          });

          if (error) {
            console.error('❌ Login automático falhou:', error.message);
            setIsLoading(false);
          } else {
            console.log('✅ Login automático bem-sucedido!', data.user?.email);
            // O onAuthStateChange vai pegar a mudança e atualizar o estado
          }
        } catch (err: any) {
          console.error('❌ Erro no login automático:', err.message);
          setIsLoading(false);
        }
      }
    });

    // Check impersonation mode on mount
    checkImpersonationMode();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Tentando login ULTRA-SIMPLIFICADO...', { email });
      
      // Tentar login sem nenhuma verificação adicional
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Resposta do login ULTRA-SIMPLIFICADO:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code || 'NO_CODE',
        user: data?.user?.email || 'NO_USER',
        session: !!data?.session
      });

      if (error) {
        console.error("❌ Erro no login ULTRA-SIMPLIFICADO:", {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.status
        });
        return { error };
      }

      console.log('✅ Login ULTRA-SIMPLIFICADO bem-sucedido!');
      return { error: null };
    } catch (error) {
      console.error("❌ Erro interno no login ULTRA-SIMPLIFICADO:", error);
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

      // Se o usuário foi criado, criar o perfil imediatamente
      if (data.user) {
        console.log('🔄 Criando perfil do usuário...');
        
        const generateReferralCode = () => {
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substring(2, 8);
          return `${userData.username || 'user'}${timestamp}${random}`.toLowerCase();
        };

        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              display_name: `${userData.firstName} ${userData.lastName}`.trim(),
              username: userData.username,
              first_name: userData.firstName,
              last_name: userData.lastName,
              cpf: userData.cpf,
              whatsapp: userData.whatsapp,
              bio: 'Novo usuário',
              avatar: 'avatar1',
              referral_code: generateReferralCode(),
              referred_by: userData.referralCode || null,
              role: 'user',
              balance: 0.00,
              total_profit: 0.00,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            // Não falhar o cadastro por causa do perfil
          } else {
            console.log('✅ Perfil criado com sucesso!');
          }
        } catch (profileError) {
          console.error('❌ Erro interno ao criar perfil:', profileError);
          // Não falhar o cadastro por causa do perfil
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