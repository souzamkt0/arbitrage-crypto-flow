import { supabase } from '@/integrations/supabase/client';

export const signInWithGoogle = async () => {
  console.log('🔄 Iniciando login com Google...');
  console.log('📍 URL atual:', window.location.href);
  console.log('📍 Origin:', window.location.origin);
  
  // Usar URL dinâmica baseada no ambiente atual
  const redirectUrl = `${window.location.origin}/dashboard`;
  
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
  console.log('📊 Dados retornados:', data);
  return data;
};
