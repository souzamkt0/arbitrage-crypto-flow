import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se estamos na porta incorreta após OAuth
    const currentPort = window.location.port;
    const isWrongPort = currentPort === '3000';
    
    if (isWrongPort) {
      console.log('⚠️ Porta incorreta detectada após OAuth:', currentPort);
      console.log('🔄 Redirecionando para porta 8080...');
      
      // Extrair o pathname da URL atual
      const currentPath = window.location.pathname;
      const newUrl = `http://localhost:8080${currentPath}`;
      
      console.log('🎯 Nova URL:', newUrl);
      
      // Redirecionar para a porta correta
      window.location.href = newUrl;
    }
  }, []);

  return null; // Componente não renderiza nada
};

export default OAuthRedirect;
