import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Verificar se temos parâmetros de OAuth na URL
      const hasOAuthParams = searchParams.has('access_token') || 
                            searchParams.has('code') || 
                            window.location.hash.includes('access_token');

      if (hasOAuthParams) {
        console.log('🔄 Detectado callback OAuth, processando...');
        
        try {
          // Aguardar um pouco para garantir que o Supabase processe o callback
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar se o usuário foi autenticado
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ OAuth bem-sucedido, redirecionando para dashboard...');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('❌ OAuth falhou, redirecionando para login...');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('❌ Erro no callback OAuth:', error);
          navigate('/login', { replace: true });
        }
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  return null; // Componente não renderiza nada
};

export default OAuthRedirect;

