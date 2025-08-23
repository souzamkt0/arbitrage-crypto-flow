import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayWithdrawal } from "@/components/DigitoPayWithdrawal";
import { DigitoPayHistory } from "@/components/DigitoPayHistory";
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
  Activity,
  ArrowDown,
  Eye,
  EyeOff
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

const Withdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [sellOrders, setSellOrders] = useState(() => generateOrderBook(25, 'sell'));
  const [buyOrders, setBuyOrders] = useState(() => generateOrderBook(25, 'buy'));
  const [sideBuyOrders, setSideBuyOrders] = useState(() => generateOrderBook(25, 'buy'));
  const [userBalance, setUserBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // Load withdrawal data
  const loadWithdrawalData = async () => {
    if (!user) return;

    try {
      // Load user balances
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance, referral_balance')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profile) {
        setUserBalance(profile.balance || 0);
        setReferralBalance(profile.referral_balance || 0);
        setResidualBalance(0);
      }

      // Load withdrawal data from DigiToPay
      const { data: withdrawals } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal');

      if (withdrawals) {
        const completed = withdrawals.filter(d => d.status === 'completed');
        const pending = withdrawals.filter(d => d.status === 'pending');
        
        setTotalWithdrawals(completed.length);
        setPendingWithdrawals(pending.length);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
    }
  };

  // Load withdrawal data when user changes
  useEffect(() => {
    loadWithdrawalData();
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

  const totalBalance = userBalance + referralBalance + residualBalance;

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
                <h2 className="text-sm font-semibold mb-1 text-primary">Saldo Disponível</h2>
                <div className="text-lg font-bold text-green-400">
                  ${totalBalance.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalWithdrawals} saques • {pendingWithdrawals} pendentes
                </div>
              </div>

              {/* Desktop Balance Header */}
              <div className="hidden md:block border-b border-border pb-4">
                <h2 className="text-sm font-semibold mb-2 text-primary">Saldo Disponível</h2>
                <div className="text-xl font-bold text-green-400">
                  ${totalBalance.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalWithdrawals} saques • {pendingWithdrawals} pendentes
                </div>
                {totalBalance > 0 && (
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-xs text-green-400 font-medium mb-1">
                      ✅ Saldo disponível para saque
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pronto para operações
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Withdrawals */}
              {pendingWithdrawals > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                      <div className="text-lg font-bold text-yellow-400">{pendingWithdrawals}</div>
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
                          ${showBalance ? totalBalance.toFixed(2) : "••••••"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Disponível para saque
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                          <ArrowDown className="h-6 w-6 text-red-400" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBalance(!showBalance)}
                          className="h-6 w-6 p-0"
                        >
                          {showBalance ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
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

              {/* Trading Chart - Fully Responsive */}
              <div className="w-full">
                <TradingChart />
              </div>

              {/* Withdrawal Interface - Fully Responsive */}
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <ArrowDown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg font-bold">Sistema de Saque</CardTitle>
                        <p className="text-sm text-muted-foreground">Escolha o tipo de saque</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-sm font-medium">SISTEMA ATIVO</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-full text-sm">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">3 Tipos de Saque • Limite: 1 por dia</span>
                    </div>
                  </div>

                  {user ? (
                    <DigitoPayWithdrawal 
                      userBalance={userBalance}
                      referralBalance={referralBalance}
                      onSuccess={() => {
                        toast({
                          title: "✅ SAQUE ENVIADO!",
                          description: "Seu saque foi processado com sucesso",
                        });
                        loadWithdrawalData(); // Refresh data
                      }} 
                    />
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl inline-block">
                        <AlertTriangle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-400 text-lg font-medium">Autenticação Necessária</p>
                        <p className="text-muted-foreground mt-2">Faça login para acessar o sistema de saques</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-blue-400 mb-2">Sistema de Saques:</h4>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• 🏦 <strong>Residual:</strong> Ganhos acumulados do sistema</li>
                          <li>• 👥 <strong>Indicação:</strong> Comissões por referrals</li>
                          <li>• 📈 <strong>Rentabilidade:</strong> Lucros dos investimentos</li>
                          <li>• ⏰ Limite: 1 saque por dia por usuário</li>
                          <li>• 💰 Valor mínimo: $10.00 USD</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              {user && (
                <Card className="bg-card border-border">
                  <CardHeader className="border-b border-border p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-orange-400" />
                      <CardTitle className="text-base md:text-lg font-bold">Histórico de Saques</CardTitle>
                      <div className="ml-auto px-3 py-1 bg-orange-500/20 rounded-full text-orange-400 text-xs font-medium">
                        TEMPO REAL
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="max-h-96 overflow-y-auto">
                      <DigitoPayHistory />
                    </div>
                  </CardContent>
                </Card>
              )}
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

export default Withdrawal;