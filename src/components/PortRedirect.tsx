import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PortRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    // Verificar se estamos na porta correta (8080)
    const currentPort = window.location.port;
    const isCorrectPort = currentPort === '8080' || currentPort === '';
    
    console.log('🔍 PortRedirect - Verificando porta...');
    console.log('📍 URL atual:', window.location.href);
    console.log('📍 Porta atual:', currentPort);
    console.log('📍 Porta correta?', isCorrectPort);
    
    if (!isCorrectPort) {
      console.log('⚠️ Porta incorreta detectada:', currentPort);
      console.log('🔄 Redirecionando para porta 8080...');
      
      // Construir nova URL com porta 8080
      const newUrl = `http://localhost:8080${location.pathname}${location.search}`;
      console.log('🎯 Nova URL:', newUrl);
      
      // Redirecionar para a porta correta
      window.location.href = newUrl;
    }
  }, [location]);

  // Adicionar listener para mudanças de URL
  useEffect(() => {
    const handleUrlChange = () => {
      console.log('🔄 URL mudou para:', window.location.href);
      console.log('📍 Nova porta:', window.location.port);
    };

    // Listener para mudanças de URL
    window.addEventListener('popstate', handleUrlChange);
    
    // Observer para mudanças no histórico
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      console.log('🔄 pushState chamado:', args);
      originalPushState.apply(history, args);
      handleUrlChange();
    };
    
    history.replaceState = function(...args) {
      console.log('🔄 replaceState chamado:', args);
      originalReplaceState.apply(history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null; // Componente não renderiza nada
};

export default PortRedirect;
