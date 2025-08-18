import { supabase } from '@/integrations/supabase/client';

export const signInWithGoogle = async () => {
  console.log('🔄 Iniciando login com Google...');
  console.log('📍 URL atual:', window.location.href);
  console.log('📍 Origin:', window.location.origin);
  console.log('📍 Port:', window.location.port);
  console.log('📍 Protocol:', window.location.protocol);
  console.log('📍 Hostname:', window.location.hostname);
  console.log('🎯 Após login será redirecionado para o painel principal');
  
  // Forçar redirecionamento para porta 8080 - Completar Perfil
  const redirectUrl = `http://localhost:8080/complete-profile`;
  
  console.log('🎯 URL de redirecionamento:', redirectUrl);
  console.log('🎯 URL completa que será enviada para o Google:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });

  if (error) {
    console.error('❌ Erro no login com Google:', error);
    throw error;
  }

  console.log('✅ Login com Google iniciado com sucesso');
  console.log('🔄 Redirecionando para o painel principal...');
  console.log('📊 Dados retornados:', data);
  return data;
};
