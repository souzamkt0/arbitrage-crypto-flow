import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthErrorHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Se não estiver carregando e há um usuário autenticado
    if (!isLoading && user) {
      console.log('✅ Usuário autenticado detectado, redirecionando para dashboard...');
      navigate('/dashboard');
      return;
    }

    // Verificar se há erros na URL
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');

    if (error || errorCode) {
      console.log('⚠️ Erro de autenticação detectado:', { error, errorCode, errorDescription });
      
      // Se o erro for de link expirado mas o usuário está autenticado, redirecionar para dashboard
      if (errorCode === 'otp_expired' && user) {
        console.log('🔄 Link expirado mas usuário autenticado, redirecionando para dashboard...');
        navigate('/dashboard');
        return;
      }

      // Se o erro for de acesso negado mas o usuário está autenticado, redirecionar para dashboard
      if (error === 'access_denied' && user) {
        console.log('🔄 Acesso negado mas usuário autenticado, redirecionando para dashboard...');
        navigate('/dashboard');
        return;
      }

      // Se não há usuário autenticado, redirecionar para login
      if (!user) {
        console.log('❌ Erro de autenticação sem usuário, redirecionando para login...');
        navigate('/login');
        return;
      }
    }

    // Verificar se há fragmentos de erro na URL
    const hash = location.hash;
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      console.log('⚠️ Erro detectado no hash da URL:', hash);
      
      // Se o usuário está autenticado, redirecionar para dashboard
      if (user) {
        console.log('🔄 Usuário autenticado, redirecionando para dashboard...');
        navigate('/dashboard');
        return;
      }

      // Se não há usuário, redirecionar para login
      console.log('❌ Sem usuário autenticado, redirecionando para login...');
      navigate('/login');
    }
  }, [location, user, isLoading, navigate]);

  // Este componente não renderiza nada, apenas trata os redirecionamentos
  return null;
};

export default AuthErrorHandler;
