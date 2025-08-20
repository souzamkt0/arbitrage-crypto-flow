import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    console.log('🔧 Criando usuário admin usando API do Supabase...');
    
    // Primeiro, tentar fazer logout para limpar qualquer sessão
    await supabase.auth.signOut();
    
    // Criar usuário usando a API oficial do Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@clean.com',
      password: '123456',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        role: 'admin',
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário admin:', error);
      return { success: false, error };
    }

    console.log('✅ Usuário admin criado com sucesso:', data.user?.email);
    return { success: true, user: data.user };
    
  } catch (err: any) {
    console.error('❌ Erro interno ao criar usuário admin:', err);
    return { success: false, error: err };
  }
};