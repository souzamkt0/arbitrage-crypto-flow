// Utilitário para definir qual admin usar
export const setAdminSession = (adminEmail: 'admin@clean.com' | 'souzamkt0@gmail.com') => {
  // Definir preferência no localStorage
  localStorage.setItem('preferred_admin', adminEmail);
  
  // Remover sessão bypass existente para forçar recriação
  localStorage.removeItem('bypass_session');
  
  // Recarregar a página para aplicar a nova sessão
  window.location.reload();
};

// Função para uso no console do navegador
(window as any).setAdmin = setAdminSession;