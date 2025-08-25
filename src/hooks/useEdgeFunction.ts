import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface EdgeFunctionOptions {
  body?: any;
  headers?: Record<string, string>;
  showLoadingToast?: boolean;
  retryOnAuthError?: boolean;
}

interface EdgeFunctionResponse<T = any> {
  data: T | null;
  error: any | null;
  isLoading: boolean;
}

export const useEdgeFunction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const checkAndRefreshSession = async (): Promise<boolean> => {
    try {
      console.log('🔄 Verificando sessão JWT...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('❌ Sessão inválida:', error?.message || 'Não encontrada');
        return false;
      }

      // Verificar se o token está próximo do vencimento (menos de 5 minutos)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 300) { // 5 minutos
        console.log('⚠️ Token próximo do vencimento, renovando...');
        
        toast({
          title: "Sessão expirada",
          description: "Fazendo login automático...",
          variant: "default",
        });

        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !newSession) {
          console.log('❌ Falha ao renovar token:', refreshError?.message);
          return false;
        }

        console.log('✅ Token renovado com sucesso');
        toast({
          title: "Sessão renovada",
          description: "Login realizado com sucesso!",
          variant: "default",
        });
        
        return true;
      }

      console.log('✅ Token JWT válido');
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return false;
    }
  };

  const handleAuthError = async (error: any, functionName: string): Promise<boolean> => {
    console.log(`🔍 Analisando erro da função ${functionName}:`, error);

    // Verificar se é erro de autenticação
    const isAuthError = 
      error?.message?.includes('invalid claim') ||
      error?.message?.includes('missing sub claim') ||
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('403') ||
      error?.message?.includes('401') ||
      (error?.status >= 401 && error?.status <= 403);

    if (isAuthError) {
      console.log('🚨 Erro de autenticação detectado');
      
      toast({
        title: "Sessão expirada",
        description: "Fazendo login automático...",
        variant: "default",
      });

      // Tentar renovar a sessão
      const renewed = await checkAndRefreshSession();
      
      if (!renewed) {
        console.log('❌ Não foi possível renovar sessão, redirecionando para login');
        
        toast({
          title: "Sessão expirada",
          description: "Redirecionando para login...",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        
        return false;
      }

      return true; // Sessão renovada, pode tentar novamente
    }

    return false; // Não é erro de auth
  };

  const callEdgeFunction = async <T = any>(
    functionName: string, 
    options: EdgeFunctionOptions = {}
  ): Promise<EdgeFunctionResponse<T>> => {
    const { 
      body, 
      headers = {}, 
      showLoadingToast = true,
      retryOnAuthError = true 
    } = options;

    setIsLoading(true);

    if (showLoadingToast) {
      toast({
        title: "Processando",
        description: `Executando ${functionName}...`,
        variant: "default",
      });
    }

    try {
      // Verificar sessão antes de chamar a função
      const sessionValid = await checkAndRefreshSession();
      
      if (!sessionValid) {
        console.log('❌ Sessão inválida, redirecionando para login');
        
        toast({
          title: "Sessão expirada",
          description: "Redirecionando para login...",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate('/auth');
        }, 2000);

        return {
          data: null,
          error: { message: 'Sessão expirada' },
          isLoading: false
        };
      }

      console.log(`🚀 Chamando edge function: ${functionName}`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      if (error) {
        console.error(`❌ Erro na edge function ${functionName}:`, error);

        // Tentar tratar erro de autenticação
        if (retryOnAuthError) {
          const shouldRetry = await handleAuthError(error, functionName);
          
          if (shouldRetry) {
            console.log('🔄 Tentando novamente após renovar sessão...');
            
            // Retry uma vez após renovar sessão
            const { data: retryData, error: retryError } = await supabase.functions.invoke(functionName, {
              body,
              headers: {
                'Content-Type': 'application/json',
                ...headers
              }
            });

            if (retryError) {
              console.error(`❌ Erro na segunda tentativa ${functionName}:`, retryError);
              
              toast({
                title: "Erro na operação",
                description: retryError.message || `Falha ao executar ${functionName}`,
                variant: "destructive",
              });

              return {
                data: null,
                error: retryError,
                isLoading: false
              };
            }

            console.log(`✅ Sucesso na segunda tentativa ${functionName}`);
            return {
              data: retryData,
              error: null,
              isLoading: false
            };
          }
        } else {
          // Mostrar erro específico em vez de "non-2xx status code"
          const errorMessage = error.message === 'Edge Function returned a non-2xx status code'
            ? `Falha na operação ${functionName}. Verifique sua conexão.`
            : error.message;

          toast({
            title: "Erro na operação",
            description: errorMessage,
            variant: "destructive",
          });
        }

        return {
          data: null,
          error,
          isLoading: false
        };
      }

      console.log(`✅ Sucesso na edge function ${functionName}:`, data);
      
      if (showLoadingToast) {
        toast({
          title: "Sucesso",
          description: `${functionName} executado com sucesso!`,
          variant: "default",
        });
      }

      return {
        data,
        error: null,
        isLoading: false
      };

    } catch (error) {
      console.error(`💥 Erro inesperado na edge function ${functionName}:`, error);
      
      toast({
        title: "Erro inesperado",
        description: `Falha ao executar ${functionName}`,
        variant: "destructive",
      });

      return {
        data: null,
        error,
        isLoading: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    callEdgeFunction,
    checkAndRefreshSession,
    isLoading
  };
};