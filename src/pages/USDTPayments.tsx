import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Coins, 
  CreditCard, 
  History, 
  Activity,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface SupportedCurrency {
  id: string;
  symbol: string;
  name: string;
  network: string;
  min_amount: number;
  max_amount: number;
  confirmation_blocks: number;
  is_active: boolean;
}

interface Transaction {
  id: string;
  amount_usd: number;
  amount_bnb: number;
  pay_currency: string;
  pay_currency_variant: string;
  status: string;
  payment_id: string;
  pay_address: string;
  qr_code_base64: string;
  created_at: string;
  expires_at: string;
}

interface PaymentStats {
  date: string;
  currency: string;
  network: string;
  total_transactions: number;
  total_volume: number;
  successful_transactions: number;
}

export default function USDTPayments() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [currencies, setCurrencies] = useState<SupportedCurrency[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('usdt');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Carregar moedas suportadas
  useEffect(() => {
    loadSupportedCurrencies();
  }, []);

  // Carregar transações do usuário e configurar real-time
  useEffect(() => {
    loadUserTransactions();

    // Set up real-time subscription for user transactions
    const subscription = supabase
      .channel('user_transactions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments'
        },
        (payload) => {
          console.log('Payment update received:', payload);
          // Reload transactions when any payment is updated
          loadUserTransactions();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bnb20_transactions'
        },
        (payload) => {
          console.log('BNB20 transaction update received:', payload);
          // Reload transactions when any BNB20 transaction is updated
          loadUserTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [refreshKey]);

  // Carregar estatísticas (só para admins)
  useEffect(() => {
    loadPaymentStats();
  }, [refreshKey]);

  const loadSupportedCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('supported_currencies')
        .select('*')
        .eq('is_active', true)
        .order('symbol', { ascending: true });

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Erro ao carregar moedas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as moedas suportadas",
        variant: "destructive",
      });
    }
  };

  const loadUserTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('bnb20_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        // Usuário não é admin ou tabela não existe
        return;
      }
      setStats(data || []);
    } catch (error) {
      // Silenciar erro para usuários não admins
    }
  };

  const createPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrencyData = currencies.find(
      c => c.symbol === selectedCurrency && c.network === selectedNetwork
    );

    if (!selectedCurrencyData) {
      toast({
        title: "Erro",
        description: "Moeda/rede não encontrada",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedCurrencyData.min_amount || amountNum > selectedCurrencyData.max_amount) {
      toast({
        title: "Erro",
        description: `Valor deve estar entre $${selectedCurrencyData.min_amount} e $${selectedCurrencyData.max_amount}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: {
          price_amount: amountNum,
          price_currency: 'usd',
          pay_currency: selectedCurrency.toLowerCase() + selectedNetwork.toLowerCase(),
          order_id: `order_${Date.now()}`,
          order_description: `Depósito USDT via ${selectedNetwork}`,
          ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`,
          success_url: `${window.location.origin}/payments?success=true`,
          cancel_url: `${window.location.origin}/payments?cancel=true`
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Pagamento criado com sucesso!",
          variant: "default",
        });
        setRefreshKey(prev => prev + 1);
        setActiveTab('history');
        setAmount('');
      } else {
        throw new Error(data.error || 'Erro ao criar pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { variant: 'outline' as const, icon: Clock, label: 'Pendente' },
      'waiting': { variant: 'outline' as const, icon: Clock, label: 'Aguardando' },
      'confirming': { variant: 'secondary' as const, icon: RefreshCw, label: 'Confirmando' },
      'confirmed': { variant: 'secondary' as const, icon: CheckCircle, label: 'Confirmado' },
      'finished': { variant: 'default' as const, icon: CheckCircle, label: 'Concluído' },
      'failed': { variant: 'destructive' as const, icon: XCircle, label: 'Falhou' },
      'refunded': { variant: 'outline' as const, icon: RefreshCw, label: 'Reembolsado' },
      'expired': { variant: 'destructive' as const, icon: AlertCircle, label: 'Expirado' }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const availableNetworks = currencies
    .filter(c => c.symbol === selectedCurrency)
    .map(c => c.network);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Sistema de Pagamentos USDT</h1>
          <p className="text-muted-foreground">
            Processe pagamentos em USDT (TRC-20, ERC-20, BSC) via NOWPayments
          </p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transações</p>
                <p className="text-lg font-semibold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-lg font-semibold">
                  {transactions.filter(t => t.status === 'finished').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">
                  {transactions.filter(t => ['pending', 'waiting', 'confirming'].includes(t.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moedas Ativas</p>
                <p className="text-lg font-semibold">{currencies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Criar Pagamento
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Tab: Criar Pagamento */}
        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Criar Novo Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Pagamentos processados via NOWPayments com validação HMAC para máxima segurança
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(currencies.map(c => c.symbol))].map(symbol => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network">Rede</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a rede" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNetworks.map(network => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                {selectedCurrency && selectedNetwork && (
                  <p className="text-sm text-muted-foreground">
                    Limites: ${currencies.find(c => c.symbol === selectedCurrency && c.network === selectedNetwork)?.min_amount} - 
                    ${currencies.find(c => c.symbol === selectedCurrency && c.network === selectedNetwork)?.max_amount}
                  </p>
                )}
              </div>

              <Button 
                onClick={createPayment} 
                disabled={loading || !amount}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Criando Pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Criar Pagamento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">${transaction.amount_usd}</p>
                            <Badge variant="outline">
                              {transaction.pay_currency?.toUpperCase()} {transaction.pay_currency_variant}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString('pt-BR')}
                          </p>
                          {transaction.payment_id && (
                            <p className="text-xs text-muted-foreground">
                              ID: {transaction.payment_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          {getStatusBadge(transaction.status)}
                          {transaction.pay_address && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.pay_address.slice(0, 10)}...{transaction.pay_address.slice(-10)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Dashboard de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Dashboard disponível apenas para administradores</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{stat.currency.toUpperCase()} ({stat.network})</p>
                          <p className="text-sm text-muted-foreground">{stat.date}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-semibold">${stat.total_volume.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.successful_transactions}/{stat.total_transactions} transações
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}