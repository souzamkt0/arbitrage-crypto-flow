import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TesteCadastroCompleto = () => {
  const [isTestingSignup, setIsTestingSignup] = useState(false);
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const generateTestData = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    
    return {
      firstName: 'Teste',
      lastName: 'Usuario',
      username: `teste_${timestamp}_${randomNum}`,
      email: `teste_${timestamp}_${randomNum}@gmail.com`,
      password: '123456789',
      cpf: '123.456.789-10',
      whatsapp: '(11) 99999-9999'
    };
  };

  const testSignup = async () => {
    setIsTestingSignup(true);
    const testData = generateTestData();
    
    try {
      console.log('🧪 === TESTE DE CADASTRO INICIADO ===');
      console.log('📊 Dados de teste:', testData);
      
      // 1. CRIAR USUÁRIO NO AUTH
      console.log('🔄 Etapa 1: Criando usuário no auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testData.email,
        password: testData.password,
        options: {
          data: {
            first_name: testData.firstName,
            last_name: testData.lastName,
            username: testData.username,
            cpf: testData.cpf,
            whatsapp: testData.whatsapp
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        throw new Error(`Erro no auth: ${authError.message}`);
      }

      const userId = authData.user?.id;
      console.log('✅ Usuário criado no auth:', userId);

      // 2. CRIAR PERFIL MANUALMENTE VIA RPC
      console.log('🔄 Etapa 2: Criando perfil via RPC...');
      const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile_manual', {
        user_id_param: userId,
        email_param: testData.email,
        first_name_param: testData.firstName,
        last_name_param: testData.lastName,
        username_param: testData.username,
        cpf_param: testData.cpf,
        whatsapp_param: testData.whatsapp,
        referral_code_param: null
      });

      if (profileError) {
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      if (!profileResult?.success) {
        throw new Error(`Falha na criação do perfil: ${profileResult?.error}`);
      }

      console.log('✅ Perfil criado via RPC:', profileResult);

      // 3. CONFIRMAR EMAIL
      console.log('🔄 Etapa 3: Confirmando email...');
      const { data: confirmResult, error: confirmError } = await supabase.rpc('confirm_email_manual', {
        user_email: testData.email
      });

      if (confirmError) {
        console.warn('⚠️ Aviso ao confirmar email:', confirmError);
      } else {
        console.log('✅ Email confirmado:', confirmResult);
      }

      // 4. VERIFICAR PERFIL CRIADO
      console.log('🔍 Etapa 4: Verificando perfil criado...');
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileCheckError) {
        console.warn('⚠️ Aviso ao buscar perfil:', profileCheckError);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }

      // 5. TESTAR LOGIN
      console.log('🔄 Etapa 5: Testando login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testData.email,
        password: testData.password
      });

      if (loginError) {
        throw new Error(`Erro no login: ${loginError.message}`);
      }

      console.log('✅ Login funcionando:', loginData.user?.email);

      // Fazer logout
      await supabase.auth.signOut();
      console.log('📤 Logout realizado');

      // RESULTADO
      const result = {
        success: true,
        testData,
        results: {
          authCreation: !!authData.user,
          profileCreation: profileResult?.success || false,
          emailConfirmation: !confirmError,
          profileCheck: !profileCheckError,
          loginTest: !!loginData.user
        }
      };

      setTestResults(result);

      toast({
        title: "✅ Teste Aprovado!",
        description: "Sistema de cadastro funcionando perfeitamente!",
        variant: "default"
      });

      console.log('🎉 === TESTE CONCLUÍDO COM SUCESSO ===');

    } catch (error: any) {
      console.error('💥 ERRO NO TESTE:', error);
      
      const result = {
        success: false,
        error: error.message,
        testData
      };

      setTestResults(result);

      toast({
        title: "❌ Teste Falhado",  
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTestingSignup(false);
    }
  };

  const testManualSignup = async () => {
    const testData = generateTestData();
    
    try {
      console.log('🧪 === TESTE MANUAL DE CADASTRO ===');
      
      // Simular o processo do useAuth
      const { data, error } = await supabase.auth.signUp({
        email: testData.email,
        password: testData.password,
        options: {
          data: {
            first_name: testData.firstName,
            last_name: testData.lastName,
            username: testData.username,
            cpf: testData.cpf,
            whatsapp: testData.whatsapp
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Usuário criado, criando perfil...');

      // Criar perfil via RPC
      const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile_manual', {
        user_id_param: data.user!.id,
        email_param: data.user!.email!,
        first_name_param: testData.firstName,
        last_name_param: testData.lastName,
        username_param: testData.username,
        cpf_param: testData.cpf,
        whatsapp_param: testData.whatsapp,
        referral_code_param: null
      });

      if (profileError || !profileResult?.success) {
        throw new Error(profileError?.message || profileResult?.error || 'Erro desconhecido');
      }

      toast({
        title: "✅ Cadastro Manual Aprovado!",
        description: `Usuário: ${testData.email} | Senha: ${testData.password}`,
        variant: "default"
      });

    } catch (error: any) {
      toast({
        title: "❌ Erro no Cadastro Manual",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-yellow-400">
          🧪 Teste Completo do Sistema de Cadastro
        </CardTitle>
        <p className="text-center text-gray-400 text-sm">
          Teste automatizado para verificar se todas as correções estão funcionando
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Botões de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testSignup}
            disabled={isTestingSignup}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          >
            {isTestingSignup ? '🔄 Testando...' : '🧪 Teste Completo'}
          </Button>
          
          <Button 
            onClick={testManualSignup}
            disabled={isTestingLogin}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
          >
            🔧 Teste Manual
          </Button>
        </div>

        {/* Resultados */}
        {testResults && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-yellow-400 font-bold mb-3">📊 Resultados do Teste:</h3>
            
            {testResults.success ? (
              <div className="space-y-2">
                <div className="text-green-400 font-bold">
                  ✅ TESTE APROVADO - Sistema funcionando!
                </div>
                
                <div className="text-sm space-y-1">
                  {Object.entries(testResults.results).map(([key, value]) => (
                    <div key={key} className={`flex items-center gap-2 ${value ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{value ? '✅' : '❌'}</span>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-700 rounded text-xs">
                  <strong>Dados de Teste:</strong><br/>
                  📧 Email: {testResults.testData.email}<br/>
                  🔐 Senha: {testResults.testData.password}<br/>
                  👤 Username: {testResults.testData.username}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-400 font-bold">
                  ❌ TESTE FALHADO
                </div>
                <div className="text-red-300 text-sm">
                  {testResults.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p><strong>🔧 Correções Implementadas:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>✅ Função RPC para criar perfis manualmente</li>
            <li>✅ Confirmação automática de email</li>
            <li>✅ Sistema de indicações funcional</li>
            <li>✅ Geração de username único</li>
            <li>✅ Bypass de triggers do Supabase</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TesteCadastroCompleto;