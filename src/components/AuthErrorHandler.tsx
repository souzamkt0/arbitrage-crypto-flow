import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthErrorHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Evitar múltiplos redirecionamentos
    if (hasRedirected.current) return;

    // Só processar se não estiver carregando
    if (isLoading) return;

    // Verificar se há erros na URL
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');

    // Verificar se há fragmentos de erro na URL
    const hash = location.hash;
    const hasHashError = hash.includes('error=access_denied') || hash.includes('error_code=otp_expired');

    // Se há erros na URL ou hash
    if (error || errorCode || hasHashError) {
      console.log('⚠️ Erro de autenticação detectado:', { error, errorCode, errorDescription, hash });
      
      hasRedirected.current = true;
      
      // Se o usuário está autenticado, redirecionar para dashboard
      if (user) {
        console.log('🔄 Usuário autenticado com erro na URL, redirecionando para dashboard...');
        navigate('/dashboard', { replace: true });
        return;
      }

      // Se não há usuário, redirecionar para login
      console.log('❌ Erro de autenticação sem usuário, redirecionando para login...');
      navigate('/login', { replace: true });
      return;
    }

    // APENAS redirecionar se estiver especificamente nas páginas de login/register
    // E APENAS se não há erros na URL
    if (user && !error && !errorCode && !hasHashError && (location.pathname === '/login' || location.pathname === '/register')) {
      console.log('✅ Usuário autenticado em página de auth, redirecionando para dashboard...');
      hasRedirected.current = true;
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location.search, location.hash, location.pathname, user, isLoading, navigate]);

  // Reset hasRedirected quando a localização muda para uma nova rota
  useEffect(() => {
    hasRedirected.current = false;
  }, [location.pathname]);

  // Este componente não renderiza nada, apenas trata os redirecionamentos
  return null;
};

export default AuthErrorHandler;

