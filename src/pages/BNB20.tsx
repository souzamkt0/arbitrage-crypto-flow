import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BNB20Deposit } from '@/components/BNB20Deposit';
import { BNB20Withdrawal } from '@/components/BNB20Withdrawal';
import { BNB20History } from '@/components/BNB20History';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Shield, 
  Zap,
  Info,
  TestTube
} from 'lucide-react';

export default function BNB20Page() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [refreshKey, setRefreshKey] = useState(0);
  const [testingIntegration, setTestingIntegration] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSuccess = () => {
    // Refresh history when transaction is successful
    setRefreshKey(prev => prev + 1);
    setActiveTab('history');
  };

  const testNOWPaymentsIntegration = async () => {
    setTestingIntegration(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Iniciando teste da integração NOWPayments...');
      
      const { data, error } = await supabase.functions.invoke('test-nowpayments-integration');
      
      if (error) {
        console.error('❌ Erro na edge function:', error);
        toast({
          title: "Erro no teste",
          description: "Falha ao executar teste da integração",
          variant: "destructive",
        });
        return;
      }

      console.log('📋 Resultado do teste:', data);
      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "✅ Teste concluído",
          description: "Integração NOWPayments funcionando corretamente!",
        });
      } else {
        toast({
          title: "⚠️ Teste falhou",
          description: "Foram encontrados problemas na integração",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('💥 Erro crítico no teste:', error);
      toast({
        title: "Erro crítico",
        description: "Falha inesperada durante o teste",
        variant: "destructive",
      });
    } finally {
      setTestingIntegration(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold">BNB20 Gateway</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Depósitos e saques via Binance Smart Chain (BSC) com processamento automatizado
          através da integração NOWPayments
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium">Processamento Rápido</h3>
            <p className="text-sm text-muted-foreground">
              Depósitos automáticos após confirmação na blockchain
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium">Seguro & Confiável</h3>
            <p className="text-sm text-muted-foreground">
              Integração oficial NOWPayments com validação HMAC
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <History className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium">Histórico Completo</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe todas suas transações em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Depósito
          </TabsTrigger>
          <TabsTrigger value="withdrawal" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Saque
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          {/* Test Integration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Teste da Integração NOWPayments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={testNOWPaymentsIntegration}
                  disabled={testingIntegration}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testingIntegration ? 'Testando...' : 'Testar Integração'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Verifica conectividade, API key e teste de pagamento de $10
                </p>
              </div>
              
              {testResult && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${testResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">
                      {testResult.success ? '✅ Integração OK' : '❌ Integração com problemas'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>Status: {testResult.summary.overall_status}</div>
                    <div>Passos executados: {testResult.summary.total_steps}</div>
                    <div>Sucessos: {testResult.summary.successful_steps}</div>
                    <div>Falhas: {testResult.summary.failed_steps}</div>
                  </div>
                  
                  {testResult.test_results && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">Ver detalhes completos</summary>
                      <pre className="mt-2 text-xs bg-background p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(testResult.test_results, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {testResult.recommendations && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Recomendações:</div>
                      <ul className="text-sm space-y-1">
                        {testResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> Crie um pagamento, envie BNB para o endereço gerado, 
              e seu saldo será creditado automaticamente após confirmação na blockchain.
            </AlertDescription>
          </Alert>
          <BNB20Deposit onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Processo de Saque:</strong> Saques são processados manualmente por motivos de segurança. 
              Tempo médio de aprovação: 1-24 horas úteis.
            </AlertDescription>
          </Alert>
          <BNB20Withdrawal onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <BNB20History key={refreshKey} />
        </TabsContent>
      </Tabs>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Rede Suportada</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Binance Smart Chain (BSC)</li>
              <li>• Token: BNB (BEP-20)</li>
              <li>• Confirmações: 12 blocos</li>
              <li>• Tempo médio: 3-5 minutos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Limites & Taxas</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Depósito mínimo: $10 USD</li>
              <li>• Saque mínimo: $20 USD</li>
              <li>• Taxa de rede: Incluída</li>
              <li>• Processamento: Automático</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}