import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  DollarSign,
  AlertTriangle,
  Play,
  Stop,
  Zap
} from "lucide-react";

interface TestTransaction {
  id: string;
  trx_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  amount_brl: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  gateway_response?: any;
}

const TestWebhook = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TestTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testAmount, setTestAmount] = useState('10');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Carregar transações existentes
  useEffect(() => {
    loadTransactions();
  }, []);

  // Monitoramento automático
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        loadTransactions();
        setLastCheck(new Date());
      }, 5000); // Verificar a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const createTestDeposit = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(testAmount);
      const brlAmount = amount * 5.85; // Taxa fixa para teste

      // Simular criação de depósito
      const testTransaction: TestTransaction = {
        id: `test-${Date.now()}`,
        trx_id: `TRX-${Date.now()}`,
        user_id: user.id,
        type: 'deposit',
        amount: amount,
        amount_brl: brlAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Salvar no banco
      const { error } = await supabase
        .from('digitopay_transactions')
        .insert({
          user_id: user.id,
          trx_id: testTransaction.trx_id,
          type: 'deposit',
          amount: amount,
          amount_brl: brlAmount,
          status: 'pending',
          person_name: profile?.display_name || 'Teste',
          person_cpf: '12345678901',
          gateway_response: { test: true, amount, brlAmount }
        });

      if (error) throw error;

      toast({
        title: 'Depósito de teste criado!',
        description: `TRX: ${testTransaction.trx_id} - $${amount} USD`
      });

      loadTransactions();
    } catch (error) {
      console.error('Erro ao criar depósito de teste:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar depósito de teste',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateWebhook = async (transaction: TestTransaction) => {
    try {
      // Simular webhook do DigitoPay
      const webhookData = {
        id: transaction.trx_id,
        status: 'PAID',
        value: transaction.amount_brl,
        person: {
          cpf: '12345678901',
          name: profile?.display_name || 'Teste'
        }
      };

      // Chamar webhook localmente
      const response = await fetch('/api/digitopay-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        toast({
          title: 'Webhook simulado!',
          description: 'Status atualizado para PAID'
        });
        loadTransactions();
      } else {
        throw new Error('Erro na resposta do webhook');
      }
    } catch (error) {
      console.error('Erro ao simular webhook:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao simular webhook',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            🧪 Teste de Webhook
          </h1>
          <p className="text-gray-400 text-lg">
            Teste o processamento automático de depósitos via webhook
          </p>
        </div>

        {/* Controles de Teste */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Zap className="h-5 w-5" />
              Controles de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="testAmount">Valor de Teste (USD)</Label>
                <Input
                  id="testAmount"
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="bg-gray-800 border-gray-600"
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={createTestDeposit}
                  disabled={isLoading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Criar Depósito de Teste
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  variant={isMonitoring ? "destructive" : "outline"}
                  className="w-full"
                >
                  {isMonitoring ? (
                    <Stop className="h-4 w-4 mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  {isMonitoring ? 'Parar Monitoramento' : 'Iniciar Monitoramento'}
                </Button>
              </div>
            </div>

            {isMonitoring && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span>Monitoramento ativo - Verificando a cada 5 segundos</span>
                </div>
                {lastCheck && (
                  <p className="text-blue-300 text-sm mt-1">
                    Última verificação: {lastCheck.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total de Transações</p>
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {transactions.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Concluídas</p>
                  <p className="text-2xl font-bold text-green-400">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Valor Total</p>
                  <p className="text-2xl font-bold text-white">
                    ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Transações */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-yellow-400">Transações de Teste</CardTitle>
              <Button
                onClick={loadTransactions}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Crie uma transação de teste para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-white">TRX: {transaction.trx_id}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          ${transaction.amount} USD
                        </p>
                        <p className="text-sm text-gray-400">
                          R$ {transaction.amount_brl.toFixed(2)} BRL
                        </p>
                      </div>

                      {getStatusBadge(transaction.status)}

                      {transaction.status === 'pending' && (
                        <Button
                          onClick={() => simulateWebhook(transaction)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Simular Pagamento
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Webhook */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Informações do Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">URL do Webhook</h4>
                <p className="text-sm text-blue-300 break-all">
                  https://www.alphabit.vu/api/webhook/digitopay
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Status</h4>
                <p className="text-sm text-green-300">
                  ✅ Configurado e funcionando
                </p>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Como Testar</h4>
              <ol className="text-sm text-yellow-300 space-y-1">
                <li>1. Crie um depósito de teste acima</li>
                <li>2. Clique em "Simular Pagamento" na transação pendente</li>
                <li>3. Observe se o status muda para "Pago" automaticamente</li>
                <li>4. Verifique se o saldo do usuário é atualizado</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestWebhook;
