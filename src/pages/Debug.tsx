import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DigitoPayService } from '@/services/digitopayService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const Debug: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('10');
  const [cpf, setCpf] = useState('12345678909');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const runDebugTest = async () => {
    setLoading(true);
    setDebugInfo(null);
    setErrorDetails(null);

    try {
      console.log('🔍 Iniciando debug completo...');

      // 1. Verificar autenticação
      const authInfo = {
        hasUser: !!user,
        userId: user?.id || 'null',
        userEmail: user?.email || 'null',
        hasProfile: !!profile,
        profileData: profile ? {
          username: profile.username,
          display_name: profile.display_name,
          balance: profile.balance
        } : null
      };

      console.log('👤 Info de autenticação:', authInfo);

      // 2. Verificar se conseguimos obter o usuário via supabase.auth.getUser()
      let supabaseUser = null;
      try {
        const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser();
        supabaseUser = sbUser;
        console.log('🔍 Supabase auth.getUser():', { user: sbUser, error: sbError });
      } catch (error) {
        console.error('❌ Erro ao obter usuário via supabase.auth.getUser():', error);
      }

      // 3. Tentar criar depósito e capturar todos os detalhes
      const usdAmount = parseFloat(amount);
      const callbackUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook';

      console.log('💰 Tentando criar depósito...');
      console.log('📋 Dados:', { usdAmount, cpf, callbackUrl });

      // Capturar o userId que será usado
      let userId = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        userId = authUser?.id || '0a9325f4-911d-431b-a8ae-1132b4167711';
        console.log('🔍 userId que será usado:', userId);
      } catch (error) {
        console.error('❌ Erro ao obter userId:', error);
        userId = '0a9325f4-911d-431b-a8ae-1132b4167711';
      }

      // 4. Chamar a Edge Function diretamente para ver o erro
      console.log('🚀 Chamando Edge Function diretamente...');
      
      const edgeFunctionData = {
        amount: usdAmount,
        cpf: cpf,
        name: 'Debug Test',
        callbackUrl: callbackUrl,
        userId: userId
      };

      console.log('📦 Dados para Edge Function:', edgeFunctionData);

      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('digitopay-deposit', {
        body: edgeFunctionData
      });

      console.log('📡 Resposta da Edge Function:', { data: edgeResult, error: edgeError });

      // 5. Compilar todas as informações
      const debugData = {
        timestamp: new Date().toISOString(),
        authInfo,
        supabaseUser: supabaseUser ? {
          id: supabaseUser.id,
          email: supabaseUser.email
        } : null,
        userIdUsed: userId,
        edgeFunctionData,
        edgeFunctionResult: {
          success: !edgeError,
          data: edgeResult,
          error: edgeError ? {
            message: edgeError.message,
            name: edgeError.name,
            context: edgeError.context
          } : null
        }
      };

      setDebugInfo(debugData);

      if (edgeError) {
        setErrorDetails(edgeError);
        toast({
          title: 'Erro na Edge Function',
          description: edgeError.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Depósito criado com sucesso',
        });
      }

    } catch (error) {
      console.error('💥 Erro geral no debug:', error);
      setErrorDetails(error);
      toast({
        title: 'Erro geral',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">🔍 Debug Page</h1>
        <p className="text-gray-400">Página para debugar problemas de depósito</p>
      </div>

      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-yellow-400">🧪 Teste de Depósito</CardTitle>
          <CardDescription>Configure os dados e execute o teste</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-yellow-400">Valor (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-yellow-500/30 text-white"
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="cpf" className="text-yellow-400">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="bg-gray-800 border-yellow-500/30 text-white"
                placeholder="12345678909"
              />
            </div>
          </div>

          <Button
            onClick={runDebugTest}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          >
            {loading ? '🔍 Executando Debug...' : '🚀 Executar Debug Completo'}
          </Button>
        </CardContent>
      </Card>

      {errorDetails && (
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">❌ Erro Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-300 bg-red-900/30 p-4 rounded-lg overflow-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {debugInfo && (
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-2 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400">📊 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-blue-300 bg-blue-900/30 p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-2 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">📋 Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-green-300">Usuário Autenticado:</span>
            <span className={user ? 'text-green-400' : 'text-red-400'}>
              {user ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">ID do Usuário:</span>
            <span className="text-green-400 font-mono text-sm">
              {user?.id || 'null'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Email:</span>
            <span className="text-green-400">
              {user?.email || 'null'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300">Perfil Carregado:</span>
            <span className={profile ? 'text-green-400' : 'text-red-400'}>
              {profile ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
