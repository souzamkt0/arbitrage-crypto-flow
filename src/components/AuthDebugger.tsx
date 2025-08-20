import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AuthDebugger = () => {
  const { user, session, profile, isLoading, signIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Teste automático de conexão e login
  useEffect(() => {
    const runAutoTests = async () => {
      if (autoLoginAttempted) return;
      setAutoLoginAttempted(true);

      addTestResult("🔍 Iniciando testes automáticos...");

      // Teste 1: Conexão básica com Supabase
      try {
        addTestResult("🧪 Testando conexão básica com Supabase...");
        const { data, error } = await supabase.from('community_posts').select('id').limit(1);
        if (error) {
          addTestResult(`❌ Erro na conexão básica: ${error.message}`);
        } else {
          addTestResult("✅ Conexão básica funcionando");
        }
      } catch (err: any) {
        addTestResult(`❌ Erro interno na conexão: ${err.message}`);
      }

      // Teste 2: Verificar sessão existente
      try {
        addTestResult("🧪 Verificando sessão existente...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          addTestResult(`❌ Erro ao verificar sessão: ${error.message}`);
        } else if (session) {
          addTestResult(`✅ Sessão existente encontrada: ${session.user?.email}`);
        } else {
          addTestResult("ℹ️ Nenhuma sessão existente");
        }
      } catch (err: any) {
        addTestResult(`❌ Erro interno ao verificar sessão: ${err.message}`);
      }

      // Teste 3: Tentativa de login automático
      if (!user && !session) {
        addTestResult("🧪 Tentando login automático...");
        try {
          const result = await signIn('admin@final.com', '123456');
          if (result.error) {
            addTestResult(`❌ Login automático falhou: ${result.error.message}`);
          } else {
            addTestResult("✅ Login automático bem-sucedido!");
          }
        } catch (err: any) {
          addTestResult(`❌ Erro interno no login automático: ${err.message}`);
        }
      }
    };

    runAutoTests();
  }, [user, session, signIn, autoLoginAttempted]);

  // Atualizar informações de debug
  useEffect(() => {
    setDebugInfo({
      hasUser: !!user,
      userEmail: user?.email || 'N/A',
      hasSession: !!session,
      sessionId: session?.access_token?.substring(0, 20) + '...' || 'N/A',
      hasProfile: !!profile,
      profileRole: profile?.role || 'N/A',
      isLoading,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [user, session, profile, isLoading]);

  const testManualLogin = async () => {
    addTestResult("🧪 Testando login manual...");
    try {
      const result = await signIn('admin@final.com', '123456');
      if (result.error) {
        addTestResult(`❌ Login manual falhou: ${result.error.message}`);
        console.error("Erro detalhado:", result.error);
      } else {
        addTestResult("✅ Login manual bem-sucedido!");
      }
    } catch (err: any) {
      addTestResult(`❌ Erro interno no login manual: ${err.message}`);
      console.error("Erro detalhado:", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-black/90 text-white border-yellow-400/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-400">🔧 Auth Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs space-y-1">
            <div><strong>User:</strong> {debugInfo.hasUser ? '✅' : '❌'} {debugInfo.userEmail}</div>
            <div><strong>Session:</strong> {debugInfo.hasSession ? '✅' : '❌'}</div>
            <div><strong>Profile:</strong> {debugInfo.hasProfile ? '✅' : '❌'} {debugInfo.profileRole}</div>
            <div><strong>Loading:</strong> {debugInfo.isLoading ? '⏳' : '✅'}</div>
            <div><strong>Updated:</strong> {debugInfo.timestamp}</div>
          </div>
          
          <Button 
            onClick={testManualLogin} 
            size="sm" 
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Testar Login Manual
          </Button>

          <div className="max-h-40 overflow-y-auto text-xs space-y-1 bg-gray-900/50 p-2 rounded">
            <div className="font-semibold text-yellow-400">📊 Resultados dos Testes:</div>
            {testResults.map((result, idx) => (
              <div key={idx} className="text-gray-300">{result}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugger;