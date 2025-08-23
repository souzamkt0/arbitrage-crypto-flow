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

// Generate realistic order book data
const generateOrderBook = (count: number, type: 'buy' | 'sell') => {
  const orders = [];
  const basePrice = 42500;
  const spreadPercent = 0.002; // 0.2% spread
  
  for (let i = 0; i < count; i++) {
    const priceOffset = type === 'sell' 
      ? spreadPercent + (i * 0.0005) // Sell orders above market price
      : -spreadPercent - (i * 0.0005); // Buy orders below market price
    
    const price = basePrice * (1 + priceOffset);
    const amount = (Math.random() * 2 + 0.1).toFixed(3);
    const total = (price * parseFloat(amount)).toFixed(0);
    const bid = (price * 0.999).toFixed(0);
    
    orders.push({
      value: `$${price.toFixed(0)}`,
      amount: amount,
      bid: `$${bid}`,
      total: `$${total}`,
      timestamp: Date.now() + i * 100
    });
  }
  
  return orders;
};

const Deposit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [sellOrders, setSellOrders] = useState(() => generateOrderBook(8, 'sell'));
  const [buyOrders, setBuyOrders] = useState(() => generateOrderBook(8, 'buy'));
  const [sideBuyOrders, setSideBuyOrders] = useState(() => generateOrderBook(8, 'buy'));
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

  // Simulate real-time order book updates from CoinMarketCap
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate fresh orders instead of accumulating
      setSellOrders(generateOrderBook(8, 'sell'));
      setBuyOrders(generateOrderBook(8, 'buy'));
      setSideBuyOrders(generateOrderBook(8, 'buy'));
    }, 1500); // Update every 1.5 seconds

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
      <div className="h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-[#151b2b] border-b border-gray-800 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2">
                Wallet
              </Button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Portfolio */}
          <div className="w-72 bg-[#151b2b] border-r border-gray-800 p-3 space-y-3 overflow-y-auto flex-shrink-0">
            {/* Deposit Balance Header */}
            <div className="border-b border-gray-800 pb-3">
              <h2 className="text-base font-semibold mb-2 text-cyan-400">Saldo Depósitos</h2>
              <div className="text-xl font-bold text-green-400">
                ${depositBalance.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                {totalDeposits} depósitos • {pendingDeposits} pendentes
              </div>
              {depositBalance > 0 && (
                <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="text-xs text-green-400 font-medium">
                    ✅ Saldo disponível no sistema
                  </div>
                  <div className="text-xs text-gray-300">
                    Pronto para trading e operações
                  </div>
                </div>
              )}
            </div>

            {/* Deposit Stats */}
            <div className="space-y-2">
              <div className="bg-[#1f2937] rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <div className="text-xs text-gray-400">Sell Orders</div>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Sell Orders List */}
                <div className="space-y-1 text-xs">
                  {[
                    { pair: 'BTC-USDT', price: '$42,850', amount: '0.142 BTC', change: '+5.024%' },
                    { pair: 'ETH-USDT', price: '$2,543', amount: '0.789 ETH', change: '+3.122%' },
                    { pair: 'XRP-USDT', price: '$0.54', amount: '1,567 XRP', change: '-2.845%' },
                    { pair: 'ADA-USDT', price: '$0.89', amount: '234 ADA', change: '+1.456%' },
                    { pair: 'DOT-USDT', price: '$7.23', amount: '89.1 DOT', change: '+4.567%' },
                  ].map((order, index) => (
                    <div key={index} className="flex justify-between items-center py-1 hover:bg-[#2a3441] px-2 rounded transition-colors border-l-2 border-red-500/30">
                      <div>
                        <div className="text-white font-medium">{order.pair}</div>
                        <div className="text-gray-400 text-xs">{order.amount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-bold">{order.price}</div>
                        <div className={`text-xs ${order.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {order.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {pendingDeposits > 0 && (
                <div className="bg-[#1f2937] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Pendentes</div>
                      <div className="text-lg font-bold text-yellow-400">{pendingDeposits}</div>
                    </div>
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Buy Orders - Left Side */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Buy Orders</h3>
                <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  LIVE
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
              </div>
              
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-1 text-xs text-gray-400 border-b border-gray-700 pb-1 mb-2">
                  <div>PREÇO</div>
                  <div>QTD</div>
                  <div>BID</div>
                  <div>TOTAL</div>
                </div>
                
                {buyOrders.map((order, index) => (
                  <div 
                    key={`left-${order.timestamp}-${index}`}
                    className="grid grid-cols-4 gap-1 text-xs py-1 px-1 hover:bg-[#1f2937] rounded transition-all duration-300 hover:scale-[1.02] animate-fade-in border-l-2 border-transparent hover:border-green-500/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="text-green-400 font-medium transition-colors duration-300 hover:text-green-300">
                      {order.value}
                    </div>
                    <div className="text-white transition-colors duration-300 hover:text-green-400">
                      {order.amount}
                    </div>
                    <div className="text-gray-300 transition-colors duration-300 hover:text-white">
                      {order.bid}
                    </div>
                    <div className="text-gray-300 transition-colors duration-300 hover:text-green-400">
                      {order.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Status */}
            <div className="mt-4">
              <div className="text-xs font-semibold mb-1 text-gray-400">Market Status</div>
              <div className="text-red-400 text-xs font-bold">USD/BTC -6.01%</div>
              <div className="h-16 bg-[#1f2937] rounded mt-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent animate-pulse"></div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-red-500/10 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Center - Main Chart Area */}
          <div className="flex-1 bg-[#0a0e1a] p-4 space-y-4 overflow-y-auto">
            {/* Deposit Interface - Moved to top */}
            <Card className="bg-[#151b2b] border border-gray-800">
              <CardHeader className="border-b border-gray-800 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white">Deposit Terminal</CardTitle>
                      <p className="text-xs text-gray-400">Sistema ativo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">ONLINE</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#1f2937] border border-gray-700 p-1">
                    <TabsTrigger 
                      value="digitopay" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span className="font-medium text-xs">PIX Instant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="usdt" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span className="font-medium text-xs">USDT Crypto</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="digitopay" className="space-y-4">
                    {user ? (
                      <DigitoPayDeposit onSuccess={() => {
                        toast({
                          title: "🎉 PARABÉNS!",
                          description: "Depósito processado com sucesso",
                        });
                        // Recarregar dados de depósito após sucesso
                        loadDepositData();
                      }} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block mx-auto">
                          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 text-sm font-medium">Authentication Required</p>
                          <p className="text-gray-400 mt-1 text-xs">Please login to access deposits</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="usdt" className="space-y-4">
                    <form onSubmit={handleBnbSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usdt-amount" className="text-purple-400 font-medium text-xs">Amount (USDT)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-3 w-3 text-purple-400" />
                            <Input
                              id="usdt-amount"
                              type="number"
                              placeholder="100.00"
                              className="pl-9 bg-[#1f2937] border-gray-700 text-white h-9 focus:border-purple-500 text-xs"
                              min="10"
                              step="0.01"
                              value={bnbForm.amount}
                              onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sender-name" className="text-purple-400 font-medium text-xs">Sender Name</Label>
                          <Input
                            id="sender-name"
                            type="text"
                            placeholder="Full name"
                            className="bg-[#1f2937] border-gray-700 text-white h-9 focus:border-purple-500 text-xs"
                            value={bnbForm.senderName}
                            onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-9 text-xs"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-2" />
                            CONFIRM CRYPTO DEPOSIT
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Chart Header */}
            <div className="bg-[#151b2b] rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-[#3b82f6] text-white rounded text-xs">XRP</button>
                  <button className="px-2 py-1 bg-[#1f2937] text-gray-300 rounded text-xs">BTC</button>
                  <button className="px-2 py-1 bg-[#1f2937] text-gray-300 rounded text-xs">USD</button>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">0.913</div>
                  <div className="text-xs text-gray-400">24h change: <span className="text-green-400">+6.01%</span></div>
                </div>
              </div>
              
              {/* Market Stats */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">24h Low</div>
                  <div className="text-white">0.753%</div>
                </div>
                <div>
                  <div className="text-gray-400">Volume</div>
                  <div className="text-white">1.1453 BTC.00</div>
                </div>
                <div>
                  <div className="text-gray-400">Market Cap</div>
                  <div className="text-white">144.89</div>
                </div>
                <div>
                  <div className="text-gray-400">Last price</div>
                  <div className="text-white">144.89</div>
                </div>
              </div>
            </div>

            {/* Orders Section - Above Chart */}
            <div className="grid grid-cols-2 gap-4">
              {/* Sell Orders */}
              <div className="bg-[#151b2b] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-white">Sell Orders</h3>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                {/* Saldo Depósito na seção Sell Orders */}
                {depositBalance > 0 && (
                  <div className="mb-3 p-2 bg-green-500/10 rounded border border-green-500/20">
                    <div className="text-xs text-green-400 font-medium">
                      💰 Saldo Disponível: ${depositBalance.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-300">
                      ✅ Seu saldo está no sistema e pronto para trading
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-1">
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>TOTAL</div>
                    <div>%</div>
                  </div>
                  {/* Live order count indicator */}
                  <div className="text-xs text-red-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {sellOrders.slice(0, 8).length} ordens ativas
                  </div>
                  {sellOrders.slice(0, 8).map((order, i) => (
                    <div key={`sell-${order.timestamp}-${i}`} className="grid grid-cols-4 gap-2 text-xs text-white py-0.5 hover:bg-[#1f2937] rounded transition-all duration-300 animate-fade-in border-l-2 border-red-500/20 hover:border-red-500/50">
                      <div className="text-red-400 transition-all duration-500 hover:text-red-300">{order.value}</div>
                      <div className="transition-all duration-500 hover:text-red-400">{order.amount}</div>
                      <div className="transition-all duration-500 hover:text-white">{order.total}</div>
                      <div className="transition-all duration-500 text-gray-400 hover:text-red-400">{((Math.random() * 40) + 10).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Orders */}
              <div className="bg-[#151b2b] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white">Buy Orders</h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                {/* Saldo Depósito na seção Buy Orders */}
                {depositBalance > 0 && (
                  <div className="mb-3 p-2 bg-green-500/10 rounded border border-green-500/20">
                    <div className="text-xs text-green-400 font-medium">
                      💰 Saldo Disponível: ${depositBalance.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-300">
                      ✅ Seu saldo está no sistema e pronto para trading
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-1">
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>TOTAL</div>
                    <div>%</div>
                  </div>
                  {/* Live order count indicator */}
                  <div className="text-xs text-green-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {buyOrders.slice(0, 8).length} ordens ativas
                  </div>
                  {buyOrders.slice(0, 8).map((order, i) => (
                    <div key={`buy-${order.timestamp}-${i}`} className="grid grid-cols-4 gap-2 text-xs text-white py-0.5 hover:bg-[#1f2937] rounded transition-all duration-300 animate-fade-in border-l-2 border-green-500/20 hover:border-green-500/50">
                      <div className="text-green-400 transition-all duration-500 hover:text-green-300">{order.value}</div>
                      <div className="transition-all duration-500 hover:text-green-400">{order.amount}</div>
                      <div className="transition-all duration-500 hover:text-white">{order.total}</div>
                      <div className="transition-all duration-500 text-gray-400 hover:text-green-400">{((Math.random() * 40) + 10).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-[#151b2b] rounded-lg p-3 flex-1 min-h-0">
              <TradingChart />
            </div>
          </div>

          {/* Right Sidebar - Trading Panel */}
          <div className="w-72 bg-[#151b2b] border-l border-gray-800 p-3 space-y-3 overflow-y-auto flex-shrink-0">
            {/* Buy Orders */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Buy Orders</h3>
                <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  LIVE
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
              </div>
              
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-1 text-xs text-gray-400 border-b border-gray-700 pb-1 mb-2">
                  <div>PREÇO</div>
                  <div>QTD</div>
                  <div>BID</div>
                  <div>TOTAL</div>
                </div>
                
                {sideBuyOrders.map((order, index) => (
                  <div 
                    key={`side-${order.timestamp}-${index}`}
                    className="grid grid-cols-4 gap-1 text-xs py-1 px-1 hover:bg-[#1f2937] rounded transition-all duration-300 hover:scale-[1.02] animate-fade-in border-l-2 border-transparent hover:border-green-500/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="text-green-400 font-medium transition-colors duration-300 hover:text-green-300">
                      {order.value}
                    </div>
                    <div className="text-white transition-colors duration-300 hover:text-green-400">
                      {order.amount}
                    </div>
                    <div className="text-gray-300 transition-colors duration-300 hover:text-white">
                      {order.bid}
                    </div>
                    <div className="text-gray-300 transition-colors duration-300 hover:text-green-400">
                      {order.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;