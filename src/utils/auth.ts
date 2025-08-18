import { supabase } from '@/integrations/supabase/client';

export const signInWithGoogle = async () => {
  console.log('🔄 Iniciando login com Google...');
  console.log('📍 URL atual:', window.location.href);
  console.log('📍 Origin:', window.location.origin);
  console.log('🎯 Após login será redirecionado para o painel principal');
  
  // Forçar redirecionamento para porta 8080
  const redirectUrl = window.location.port === '8080' || window.location.port === '' 
    ? `${window.location.origin}/dashboard`
    : `http://localhost:8080/dashboard`;
  
  console.log('🎯 URL de redirecionamento:', redirectUrl);
  
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
  return data;
};
