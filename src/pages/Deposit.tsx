import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { TradingChart } from "@/components/TradingChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Smartphone, 
  DollarSign,
  Wallet,
  AlertTriangle,
  Zap,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

// Generate realistic order book data with thousands of orders
const generateOrderBook = (count: number, type: 'buy' | 'sell') => {
  const orders = [];
  const basePrice = 42500;
  const spreadPercent = 0.002; // 0.2% spread
  
  // Popular exchanges/brokers
  const exchanges = [
    'Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'Huobi', 'KuCoin', 
    'OKX', 'Bybit', 'Gate.io', 'Crypto.com', 'Gemini', 'FTX',
    'Bitstamp', 'Bittrex', 'Poloniex', 'HitBTC', 'MEXC', 'Bitget'
  ];
  
  for (let i = 0; i < count; i++) {
    const priceOffset = type === 'sell' 
      ? spreadPercent + (i * 0.0003) // Sell orders above market price
      : -spreadPercent - (i * 0.0003); // Buy orders below market price
    
    const price = basePrice * (1 + priceOffset);
    const amount = (Math.random() * 5 + 0.1).toFixed(3);
    const total = (price * parseFloat(amount)).toFixed(0);
    const bid = (price * 0.999).toFixed(0);
    const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    
    orders.push({
      value: `$${price.toFixed(0)}`,
      amount: amount,
      bid: `$${bid}`,
      total: `$${total}`,
      exchange: exchange,
      timestamp: Date.now() + i * 10
    });
  }
  
  return orders;
};

const Deposit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [sellOrders, setSellOrders] = useState(() => generateOrderBook(25, 'sell'));
  const [buyOrders, setBuyOrders] = useState(() => generateOrderBook(25, 'buy'));
  const [sideBuyOrders, setSideBuyOrders] = useState(() => generateOrderBook(25, 'buy'));
  const [depositBalance, setDepositBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);

  // Load deposit data from DigiToPay
  const loadDepositData = async () => {
    if (!user) return;

    try {
      const { data: deposits } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'deposit');

      if (deposits) {
        const completed = deposits.filter(d => d.status === 'completed');
        const pending = deposits.filter(d => d.status === 'pending');
        
        const totalUSD = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const pendingUSD = pending.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        setDepositBalance(totalUSD);
        setTotalDeposits(completed.length);
        setPendingDeposits(pending.length);
      }
    } catch (error) {
      console.error('Error loading deposit data:', error);
    }
  };

  // Load deposit data when user changes
  useEffect(() => {
    loadDepositData();
  }, [user]);

  // Simulate real-time order book updates from CoinMarketCap - Thousands of orders
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate fresh orders instead of accumulating - More frequent updates
      setSellOrders(generateOrderBook(25, 'sell'));
      setBuyOrders(generateOrderBook(25, 'buy'));
      setSideBuyOrders(generateOrderBook(25, 'buy'));
    }, 300); // Update every 300ms for non-stop activity

    return () => clearInterval(interval);
  }, []);

  // BNB Form State
  const [bnbForm, setBnbForm] = useState({
    amount: "",
    senderName: ""
  });

  const handleBnbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bnbForm.amount || !bnbForm.senderName) {
      toast({
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos para o depósito USDT BNB20",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast({
        title: "Informações enviadas!",
        description: "Envie o USDT para o endereço fornecido. O depósito será processado em até 15 minutos.",
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Terminal de Depósitos</h1>
                <p className="text-sm text-slate-300">• Sistema Ativo • Depósitos em Tempo Real</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">${depositBalance.toFixed(2)}</div>
                <div className="text-sm text-slate-300">Saldo Atual</div>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Panel - 25% */}
          <div className="w-1/4 bg-slate-800/50 border-r border-slate-700 h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Stats Cards */}
              <div className="space-y-3">
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Depósitos Hoje</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">{totalDeposits}</div>
                  <div className="text-xs text-slate-400">Transações confirmadas</div>
                </div>

                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />
                    <span className="text-sm font-semibold text-white">Pendentes</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-400">{pendingDeposits}</div>
                  <div className="text-xs text-slate-400">Aguardando confirmação</div>
                </div>
              </div>

              {/* Live Orders */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-semibold text-white">Ordens Live</span>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {sellOrders.slice(0, 8).map((order, index) => (
                    <div 
                      key={`sell-${index}`}
                      className="grid grid-cols-3 gap-1 text-xs p-2 bg-slate-700/50 rounded border-l-2 border-red-500/50"
                    >
                      <div className="text-yellow-400 font-medium truncate">
                        {order.exchange}
                      </div>
                      <div className="text-red-400 font-medium">
                        {order.value}
                      </div>
                      <div className="text-white">
                        {order.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - 50% */}
          <div className="flex-1 w-1/2 p-6">
            <div className="space-y-6">
              {/* Trading Chart */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">BTC/USDT - Gráfico em Tempo Real</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-400">LIVE</span>
                  </div>
                </div>
                <div className="h-80">
                  <TradingChart />
                </div>
              </div>

              {/* Deposit Interface */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader className="border-b border-slate-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">Interface de Depósito</CardTitle>
                        <p className="text-sm text-slate-300">Sistema online e operacional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-medium">ONLINE</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700 border border-slate-600 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white py-2 px-3 text-sm font-medium"
                      >
                        <Smartphone className="h-4 w-4" />
                        PIX Instant
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2 px-3 text-sm font-medium"
                      >
                        <CreditCard className="h-4 w-4" />
                        USDT Crypto
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="digitopay" className="space-y-4">
                      {user ? (
                        <DigitoPayDeposit onSuccess={() => {
                          toast({
                            title: "🎉 PARABÉNS!",
                            description: "Depósito processado com sucesso",
                          });
                          loadDepositData();
                        }} />
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block mx-auto">
                            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                            <p className="text-red-400 font-medium mb-1">Authentication Required</p>
                            <p className="text-slate-400 text-sm">Please login to access deposits</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="usdt" className="space-y-4">
                      <form onSubmit={handleBnbSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="usdt-amount" className="text-blue-400 font-medium">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                              <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="100.00"
                                className="pl-10 bg-slate-700 border-slate-600 text-white h-12 focus:border-blue-500"
                                min="10"
                                step="0.01"
                                value={bnbForm.amount}
                                onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sender-name" className="text-blue-400 font-medium">Sender Name</Label>
                            <Input
                              id="sender-name"
                              type="text"
                              placeholder="Full name"
                              className="bg-slate-700 border-slate-600 text-white h-12 focus:border-blue-500"
                              value={bnbForm.senderName}
                              onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              CONFIRM CRYPTO DEPOSIT
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel - 25% */}
          <div className="w-1/4 bg-slate-800/50 border-l border-slate-700 h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Buy Orders */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Ordens de Compra</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {buyOrders.slice(0, 8).map((order, index) => (
                    <div 
                      key={`buy-${index}`}
                      className="grid grid-cols-3 gap-1 text-xs p-2 bg-slate-700/50 rounded border-l-2 border-emerald-500/50"
                    >
                      <div className="text-yellow-400 font-medium truncate">
                        {order.exchange}
                      </div>
                      <div className="text-emerald-400 font-medium">
                        {order.value}
                      </div>
                      <div className="text-white">
                        {order.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Activity */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Atividade do Mercado</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Volume 24h:</span>
                    <span className="text-emerald-400 font-semibold">$2.8B</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Variação:</span>
                    <span className="text-emerald-400 font-semibold">+2.4%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Exchanges Ativas:</span>
                    <span className="text-white font-semibold">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;