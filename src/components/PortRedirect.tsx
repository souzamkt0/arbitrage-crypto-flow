import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PortRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    // Verificar se estamos na porta correta (8080)
    const currentPort = window.location.port;
    const isCorrectPort = currentPort === '8080' || currentPort === '';
    
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

  return null; // Componente não renderiza nada
};

export default PortRedirect;
