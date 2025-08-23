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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header Navigation - Fully Responsive */}
        <header className="bg-card border-b border-border px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              {/* Logo placeholder for mobile */}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent/50">
                <Bell className="h-4 w-4" />
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 text-sm font-medium">
                Wallet
              </Button>
            </div>
          </div>
        </header>

        {/* Main Layout - Mobile-First Responsive */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar - Progressive disclosure */}
          <div className="hidden md:block md:w-64 lg:w-72 bg-card border-r border-border flex-shrink-0">
            <div className="h-full overflow-y-auto p-3 space-y-4">
              
              {/* Mobile Balance Header - Visible on mobile */}
              <div className="md:hidden bg-muted/50 rounded-lg p-4 mb-4">
                <h2 className="text-sm font-semibold mb-1 text-primary">Saldo Depósitos</h2>
                <div className="text-lg font-bold text-green-400">
                  ${depositBalance.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalDeposits} depósitos • {pendingDeposits} pendentes
                </div>
              </div>

              {/* Desktop Balance Header */}
              <div className="hidden md:block border-b border-border pb-4">
                <h2 className="text-sm font-semibold mb-2 text-primary">Saldo Depósitos</h2>
                <div className="text-xl font-bold text-green-400">
                  ${depositBalance.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalDeposits} depósitos • {pendingDeposits} pendentes
                </div>
                {depositBalance > 0 && (
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-xs text-green-400 font-medium mb-1">
                      ✅ Saldo disponível no sistema
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pronto para trading e operações
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Deposits */}
              {pendingDeposits > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                      <div className="text-lg font-bold text-yellow-400">{pendingDeposits}</div>
                    </div>
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Live Sell Orders */}
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-400 animate-pulse" />
                  <h3 className="text-sm font-semibold">Live Sell Orders</h3>
                  <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                    LIVE
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground border-b border-border pb-1 mb-2">
                    <div className="hidden lg:block">EXCHANGE</div>
                    <div className="lg:hidden">EX</div>
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>BID</div>
                    <div>TOTAL</div>
                  </div>
                 
                  {sellOrders.map((order, index) => (
                    <div 
                      key={`left-sell-${order.timestamp}-${index}`}
                      className="grid grid-cols-5 gap-1 text-xs py-1 px-1 hover:bg-accent/50 rounded transition-all duration-200 hover:scale-[1.02] animate-fade-in border-l-2 border-transparent hover:border-red-500/50"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-yellow-400 font-medium transition-colors duration-200 hover:text-yellow-300 truncate">
                        <span className="hidden lg:inline">{order.exchange}</span>
                        <span className="lg:hidden">{order.exchange.slice(0, 3)}</span>
                      </div>
                      <div className="text-red-400 font-medium transition-colors duration-200 hover:text-red-300">
                        {order.value}
                      </div>
                      <div className="text-foreground transition-colors duration-200 hover:text-red-400">
                        {order.amount}
                      </div>
                      <div className="text-muted-foreground transition-colors duration-200 hover:text-foreground">
                        {order.bid}
                      </div>
                      <div className="text-muted-foreground transition-colors duration-200 hover:text-red-400">
                        {order.total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Center - Main Content Area - Fully Responsive */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="h-full p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
              
              {/* Mobile Balance Card - Only visible on mobile */}
              <div className="md:hidden">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-primary">Saldo Total</h2>
                        <div className="text-2xl font-bold text-green-400">
                          ${depositBalance.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {totalDeposits} depósitos completos
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Live Orders Box - Only visible on mobile */}
              <div className="md:hidden">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Live Sell Orders */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-4 w-4 text-red-400" />
                          <h3 className="text-sm font-semibold text-red-400">Live Sell</h3>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {sellOrders.slice(0, 5).map((order, index) => (
                            <div 
                              key={`mobile-sell-${index}`}
                              className="grid grid-cols-2 gap-1 text-xs p-2 bg-muted/30 rounded border-l-2 border-red-500/50"
                            >
                              <div className="text-red-400 font-medium">
                                {order.value}
                              </div>
                              <div className="text-foreground">
                                {order.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Buy Orders */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <h3 className="text-sm font-semibold text-green-400">Live Buy</h3>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {buyOrders.slice(0, 5).map((order, index) => (
                            <div 
                              key={`mobile-buy-${index}`}
                              className="grid grid-cols-2 gap-1 text-xs p-2 bg-muted/30 rounded border-l-2 border-green-500/50"
                            >
                              <div className="text-green-400 font-medium">
                                {order.value}
                              </div>
                              <div className="text-foreground">
                                {order.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deposit Interface - Fully Responsive */}
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg font-bold">Deposit Terminal</CardTitle>
                        <p className="text-sm text-muted-foreground">Sistema ativo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">ONLINE</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 bg-muted border border-border p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-3 text-sm font-medium"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span className="hidden sm:inline">PIX Instant</span>
                        <span className="sm:hidden">PIX</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2 px-3 text-sm font-medium"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">USDT Crypto</span>
                        <span className="sm:hidden">USDT</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="digitopay" className="space-y-4 md:space-y-6">
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
                            <p className="text-muted-foreground text-sm">Please login to access deposits</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="usdt" className="space-y-4 md:space-y-6">
                      <form onSubmit={handleBnbSubmit} className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="usdt-amount" className="text-purple-400 font-medium">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                              <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="100.00"
                                className="pl-10 bg-muted border-border text-foreground h-12 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                min="10"
                                step="0.01"
                                value={bnbForm.amount}
                                onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sender-name" className="text-purple-400 font-medium">Sender Name</Label>
                            <Input
                              id="sender-name"
                              type="text"
                              placeholder="Full name"
                              className="bg-muted border-border text-foreground h-12 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              value={bnbForm.senderName}
                              onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-12 text-sm md:text-base"
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

              {/* Trading Chart - Fully Responsive */}
              <Card className="bg-card border-border">
                <CardContent className="p-3 md:p-4">
                  <div className="h-[400px] md:h-[500px] lg:h-[600px]">
                    <TradingChart />
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Live Orders - Only visible on small screens */}
              <div className="md:hidden">
                <Card className="bg-card border-border">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400 animate-pulse" />
                      <CardTitle className="text-base">Live Orders</CardTitle>
                      <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">LIVE</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-red-400 font-medium">Sell Orders</div>
                        {sellOrders.slice(0, 4).map((order, i) => (
                          <div key={`mobile-sell-${i}`} className="text-sm">
                            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-red-400 font-medium">{order.value}</span>
                              <span className="text-foreground">{order.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-green-400 font-medium">Buy Orders</div>
                        {buyOrders.slice(0, 4).map((order, i) => (
                          <div key={`mobile-buy-${i}`} className="text-sm">
                            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-green-400 font-medium">{order.value}</span>
                              <span className="text-foreground">{order.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile/tablet, visible on lg+ */}
          <div className="hidden lg:block lg:w-64 xl:w-72 bg-card border-l border-border flex-shrink-0">
            <div className="h-full overflow-y-auto p-3 space-y-4">
              
              {/* Buy Orders */}
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-400 animate-pulse" />
                  <h3 className="text-sm font-semibold">Live Buy Orders</h3>
                  <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                    LIVE
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                <div className="space-y-1">
                  <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground border-b border-border pb-1 mb-2">
                    <div className="hidden xl:block">EXCHANGE</div>
                    <div className="xl:hidden">EX</div>
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>BID</div>
                    <div>TOTAL</div>
                  </div>
                  
                  {sideBuyOrders.map((order, index) => (
                    <div 
                      key={`side-${order.timestamp}-${index}`}
                      className="grid grid-cols-5 gap-1 text-xs py-1 px-1 hover:bg-accent/50 rounded transition-all duration-200 hover:scale-[1.02] animate-fade-in border-l-2 border-transparent hover:border-green-500/50"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-yellow-400 font-medium transition-colors duration-200 hover:text-yellow-300 truncate">
                        <span className="hidden xl:inline">{order.exchange}</span>
                        <span className="xl:hidden">{order.exchange.slice(0, 3)}</span>
                      </div>
                      <div className="text-green-400 font-medium transition-colors duration-200 hover:text-green-300">
                        {order.value}
                      </div>
                      <div className="text-foreground transition-colors duration-200 hover:text-green-400">
                        {order.amount}
                      </div>
                      <div className="text-muted-foreground transition-colors duration-200 hover:text-foreground">
                        {order.bid}
                      </div>
                      <div className="text-muted-foreground transition-colors duration-200 hover:text-green-400">
                        {order.total}
                      </div>
                    </div>
                  ))}
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